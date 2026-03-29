import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, category, message } = await request.json()

    // Validate input
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Save to database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        category,
        message
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Send email using Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    // Email content (simple text format)
    const emailText = `
New Contact Form Submission

From: ${name}
Email: ${email}
Category: ${category}

Message:
${message}

---
Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
`

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `[84Sulyap] New ${category} Inquiry from ${name}`,
      text: emailText
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!'
    })
  } catch (error: any) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
