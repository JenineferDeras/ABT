<!-- markdownlint-disable MD033 MD041 -->
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a> ·
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>
<!-- markdownlint-enable MD033 MD041 -->

# ABACO Financial Intelligence Platform

A Next.js 15 application with Supabase integration for financial analysis and risk assessment.

## 🚀 Current Status

**Phase 1: Foundation** ✅ Complete

- Next.js 15 + Supabase infrastructure
- Authentication system
- ML prediction framework (Continue Learning)
- Basic API endpoints
- Test suite with Jest

**Phase 2: Deployment** 🔄 In Progress

- Environment configuration
- Production deployment
- Monitoring setup

## 📋 Project Phases

### Phase 1: Foundation ✅ (Completed)

- [x] Next.js 15 with App Router
- [x] Supabase authentication and database
- [x] TypeScript strict mode
- [x] Tailwind CSS + shadcn/ui
- [x] ML prediction tracking framework
- [x] Jest test suite
- [x] ESLint + Prettier

### Phase 2: Deployment 🔄 (Current)

- [ ] Configure production environment variables
- [ ] Deploy to Vercel/Netlify
- [ ] Set up monitoring
- [ ] Configure CI/CD

### Phase 3: Data Integration (Next 2-4 weeks)

- [ ] Supabase database schema for factoring business
- [ ] CRUD API endpoints
- [ ] Data import tools
- [ ] Google Drive integration (optional)

### Phase 4: Analytics & AI (4-8 weeks)

- [ ] Risk assessment algorithms
- [ ] Financial analysis dashboards
- [ ] Credit scoring models
- [ ] Automated reporting

### Phase 5: Advanced Features (8-12 weeks)

- [ ] Advanced AI agents
- [ ] Multi-market expansion
- [ ] Automated decision engines
- [ ] Scalability optimizations

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: xAI Grok integration
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel (or Netlify)

## 📦 Quick Start

### Prerequisites

- Node.js 20.x or later
- npm (official package manager)
- Supabase account
- Git

### Local Development

1. **Clone repository**

   ```bash
   git clone https://github.com/Jeninefer/nextjs-with-supabase.git
   cd nextjs-with-supabase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual Supabase credentials
   ```

4. **Run database migrations**

   ```bash
   npx supabase db push
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/ml/continue-learning.test.ts
```

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT_QUICK_START.md)
- [ML Framework](./docs/ML_FRAMEWORK.md)
- [PR #270 Summary](./docs/PR_270_SUMMARY.md)
- [Google Cloud Setup](./docs/GOOGLE_CLOUD_SETUP.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🔐 Environment Variables

Required variables (get from [Supabase Dashboard](https://supabase.com/dashboard)):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional variables:

```bash
GROK_API_KEY=your-grok-api-key  # For AI features
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## 🚢 Deployment

See [Deployment Quick Start](./docs/DEPLOYMENT_QUICK_START.md) for detailed instructions.

**Quick deploy to Vercel:**

```bash
vercel --prod
```

**Alternative platforms:**

- Netlify (no deployment limits)
- Railway (Docker support)
- Supabase Edge Functions (backend only)

## 🐛 Known Issues

1. **Vercel Rate Limit**: Free tier limited to 100 deployments/day
   - **Solution**: Use Git integration or upgrade to Pro
2. **Missing Dependencies**: Ensure `zod` and `@testing-library/jest-dom` are installed

   - **Solution**: Run `npm install`

3. **Textarea Component**: May need manual installation
   - **Solution**: Run `npx shadcn@latest add textarea`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn/ui for beautiful components
- Vercel for hosting

## 📞 Support

- **Issues**: https://github.com/Jeninefer/nextjs-with-supabase/issues
- **Discussions**: https://github.com/Jeninefer/nextjs-with-supabase/discussions
- **Email**: support@abacocapital.co

---

**Current Version**: 0.1.0  
**Last Updated**: 2025-01-06  
**Status**: 🟢 Development Active
