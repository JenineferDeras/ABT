import { createClient } from '@/lib/supabase/server'
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules at top level
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

describe('Supabase Server Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    const createMockCookieStore = () => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    })

    it('server client handles cookies', async () => {
        const mockCookies = createMockCookieStore()
        const { cookies } = require('next/headers')
        cookies.mockReturnValue(mockCookies)

        const client = await createClient()

        expect(client).toBeDefined()
        expect(cookies).toHaveBeenCalled()
    })

    it('createClient creates server client with correct parameters', async () => {
        const mockCookies = createMockCookieStore()
        const { cookies } = require('next/headers')
        const { createServerClient } = require('@supabase/ssr')

        cookies.mockReturnValue(mockCookies)

        await createClient()

        expect(createServerClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            expect.objectContaining({
                cookies: expect.objectContaining({
                    get: expect.any(Function),
                    set: expect.any(Function),
                    remove: expect.any(Function),
                }),
            })
        )
    })

    it('cookies adapter proxies get/set/remove correctly', async () => {
        const mockCookies = createMockCookieStore()
        mockCookies.get.mockReturnValue({ value: 'v1' })
        const { cookies } = require('next/headers')
        const { createServerClient } = require('@supabase/ssr')

        cookies.mockReturnValue(mockCookies)

        await createClient()

        const adapter = createServerClient.mock.calls[0][2].cookies
        expect(adapter.get('session')).toBe('v1')
        expect(mockCookies.get).toHaveBeenCalledWith('session')

        adapter.set('session', 'value', { path: '/' })
        expect(mockCookies.set).toHaveBeenCalledWith('session', 'value', { path: '/' })

        adapter.remove('session', { path: '/' })
        expect(mockCookies.delete).toHaveBeenCalledWith('session', { path: '/' })
    })

    it('resolveCookieStore handles promise-like objects', async () => {
        const mockPromiseCookies = Promise.resolve({
            get: vi.fn(),
            set: vi.fn(),
            delete: vi.fn(),
        })

        const { cookies } = require('next/headers')
        cookies.mockReturnValue(mockPromiseCookies)

        const client = await createClient()

        expect(client).toBeDefined()
    })

    it('server client has expected auth methods', async () => {
        const mockCookies = createMockCookieStore()

        const { cookies } = require('next/headers')
        cookies.mockReturnValue(mockCookies)

        const client = await createClient()

        expect(typeof client.auth.signOut).toBe('function')
        expect(typeof client.auth.getUser).toBe('function')
        expect(typeof client.auth.getClaims).toBe('function')
    })
})
