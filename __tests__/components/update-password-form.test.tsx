import { UpdatePasswordForm } from '@/components/update-password-form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}))

// Mock Supabase client
const mockUpdateUser = jest.fn()
const mockSupabaseClient = {
    auth: {
        updateUser: mockUpdateUser,
    },
}

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabaseClient,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, type, className, ...props }: any) => (
        <button disabled={disabled} type={type} className={className} {...props}>
            {children}
        </button>
    ),
}))

jest.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    CardTitle: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
}))

jest.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}))

describe("UpdatePasswordForm Component", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders the component with all form elements", async () => {
        const searchParams = Promise.resolve({});
        render(<UpdatePasswordForm searchParams={searchParams} />)

        expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
        expect(screen.getByText('Please enter your new password below.')).toBeInTheDocument()
        expect(screen.getByLabelText('New password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save new password' })).toBeInTheDocument()
    })

    test("validates password requirements", async () => {
        const searchParams = Promise.resolve({});
        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password') as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        // Test with a weak password
        await userEvent.type(passwordInput, 'weak')
        await userEvent.click(submitButton)

        expect(screen.getByText('Password must be at least 8 characters long, contain uppercase and lowercase letters, numbers, and symbols.')).toBeInTheDocument()

        // Test with a strong password
        await userEvent.clear(passwordInput)
        await userEvent.type(passwordInput, 'Str0ngP@ssword!')
        await userEvent.click(submitButton)

        expect(screen.queryByText('Password must be at least 8 characters long, contain uppercase and lowercase letters, numbers, and symbols.')).not.toBeInTheDocument()
    })

    test("validates password confirmation match", async () => {
        const searchParams = Promise.resolve({});
        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password') as HTMLInputElement
        const confirmPasswordInput = screen.getByLabelText('Confirm new password') as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        // Type password and confirmation
        await userEvent.type(passwordInput, 'Str0ngP@ssword!')
        await userEvent.type(confirmPasswordInput, 'Str0ngP@ssword!')
        await userEvent.click(submitButton)

        // Passwords match, no error should be displayed
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()

        // Change confirmation to an incorrect value
        await userEvent.clear(confirmPasswordInput)
        await userEvent.type(confirmPasswordInput, 'WrongP@ssword')
        await userEvent.click(submitButton)

        // Error message should be displayed
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    test("successfully updates password", async () => {
        const searchParams = Promise.resolve({});
        mockUpdateUser.mockResolvedValue({ error: null })

        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await userEvent.type(passwordInput, 'NewSecurePassword123!')
        await userEvent.click(submitButton)

        expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewSecurePassword123!' })

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/protected')
        })
    })

    test("displays error message when password update fails", async () => {
        const searchParams = Promise.resolve({});
        mockUpdateUser.mockResolvedValue({ error: { message: 'Password update failed' } })

        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await userEvent.type(passwordInput, 'NewSecurePassword123!')
        await userEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Password update failed')).toBeInTheDocument()
        })
    })

    test("disables submit button when validation fails", async () => {
        const searchParams = Promise.resolve({});
        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password') as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        // Initially, the button should be enabled
        expect(submitButton).not.toBeDisabled()

        // Enter a weak password
        await userEvent.type(passwordInput, 'weak')
        expect(submitButton).toBeDisabled()

        // Enter a strong password
        await userEvent.clear(passwordInput)
        await userEvent.type(passwordInput, 'Str0ngP@ssword!')
        expect(submitButton).not.toBeDisabled()
    })

    test("handles non-Error exceptions gracefully", async () => {
        const searchParams = Promise.resolve({});
        mockUpdateUser.mockRejectedValue('String error')

        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await userEvent.type(passwordInput, 'NewSecurePassword123!')
        await userEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
        })
    })

    test("clears validation errors on valid input", async () => {
        const searchParams = Promise.resolve({});
        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password') as HTMLInputElement
        const confirmPasswordInput = screen.getByLabelText('Confirm new password') as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        // Enter a weak password and submit
        await userEvent.type(passwordInput, 'weak')
        await userEvent.click(submitButton)

        // Error should be displayed
        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters long, contain uppercase and lowercase letters, numbers, and symbols.')).toBeInTheDocument()
        })

        // Enter a strong password that doesn't match confirmation
        await userEvent.clear(passwordInput)
        await userEvent.type(passwordInput, 'Str0ngP@ssword!')
        await userEvent.click(submitButton)

        // Password mismatch error should be displayed
        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
        })

        // Enter matching confirmation and submit
        await userEvent.clear(confirmPasswordInput)
        await userEvent.type(confirmPasswordInput, 'Str0ngP@ssword!')
        await userEvent.click(submitButton)

        // No error should be displayed now
        await waitFor(() => {
            expect(screen.queryByText('Password must be at least 8 characters long, contain uppercase and lowercase letters, numbers, and symbols.')).not.toBeInTheDocument()
            expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
        })
    })

    test("shows loading state during submission", async () => {
        const searchParams = Promise.resolve({});
        let resolvePromise: (value: any) => void
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve
        })
        mockUpdateUser.mockReturnValue(pendingPromise)

        render(<UpdatePasswordForm searchParams={searchParams} />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await userEvent.type(passwordInput, 'NewSecurePassword123!')
        await userEvent.click(submitButton)

        // Button should show loading state
        expect(screen.getByText('Saving...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()

        // Resolve the promise
        resolvePromise!({ error: null })

        await waitFor(() => {
            expect(screen.getByText('Save new password')).toBeInTheDocument()
            expect(submitButton).not.toBeDisabled()
        })
    })
})