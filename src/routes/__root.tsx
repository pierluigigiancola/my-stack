import { createTheme, ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core'
import mantineCss from '@mantine/core/styles.css?url';
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import Footer from '#/components/Footer'
import Header from '#/components/Header'
import PostHogProvider from '#/integrations/posthog/provider'
import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools'
import StoreDevtools from '#/lib/demo-store-devtools'
import { getLocale } from '#/paraglide/runtime'
import appCss from '#/styles.css?url';


interface MyRouterContext {
  queryClient: QueryClient
}

const theme = createTheme({
  /** Put your mantine theme override here */
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    links: [
      {
        href: mantineCss,
        rel: 'stylesheet',
      },
      {
        href: appCss,
        rel: 'stylesheet',
      },
    ],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      {...mantineHtmlProps}
      suppressHydrationWarning
      lang={getLocale()}
    >
      <head>
        <HeadContent />

        <ColorSchemeScript />
      </head>

      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <MantineProvider theme={theme}>
          <PostHogProvider>
            <Header />

            {children}

            <Footer />

            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                StoreDevtools,
                TanStackQueryDevtools,
              ]}
            />
          </PostHogProvider>
        </MantineProvider>

        <Scripts />
      </body>
    </html>
  )
}
