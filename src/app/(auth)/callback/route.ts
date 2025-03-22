import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification Successful</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f9fafb;
              }
              .container {
                background-color: white;
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              .title {
                color: #111827;
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
              }
              .message {
                color: #6b7280;
                margin-bottom: 1.5rem;
              }
              .countdown {
                color: #4f46e5;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 class="title">Email Verified Successfully!</h2>
              <p class="message">Your email has been verified.</p>
              <p class="countdown">Redirecting in <span id="timer">3</span> seconds...</p>
            </div>

            <script>
              let timeLeft = 3;
              const timerElement = document.getElementById('timer');
              
              const countdown = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                  clearInterval(countdown);
                  window.location.href = '/';
                }
              }, 1000);
            </script>
          </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
  }

  // Return the user to the login page if something goes wrong
  return NextResponse.redirect(new URL('/login', request.url))
} 