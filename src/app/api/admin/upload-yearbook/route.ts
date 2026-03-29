import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageNumber = parseInt(formData.get('pageNumber') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!pageNumber || pageNumber < 1 || pageNumber > 98) {
      return NextResponse.json({ error: 'Invalid page number (must be 1-98)' }, { status: 400 })
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'yearbook',
      public_id: `page_${pageNumber.toString().padStart(3, '0')}`,
      resource_type: 'image',
      overwrite: true,
    })

    // Save to database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('yearbook_pages')
      .upsert({
        page_number: pageNumber,
        cloudinary_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'page_number'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      // Try to delete from Cloudinary if database save failed
      await cloudinary.uploader.destroy(uploadResult.public_id)
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        page_number: pageNumber,
        cloudinary_url: uploadResult.secure_url,
      }
    })
  } catch (error: any) {
    console.error('Error uploading yearbook page:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload yearbook page' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageNumber = parseInt(searchParams.get('pageNumber') || '')

    if (!pageNumber || pageNumber < 1 || pageNumber > 98) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the page data to find Cloudinary public_id
    const { data: page } = await supabase
      .from('yearbook_pages')
      .select('cloudinary_public_id')
      .eq('page_number', pageNumber)
      .single()

    if (page?.cloudinary_public_id) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(page.cloudinary_public_id)
    }

    // Delete from database
    const { error } = await supabase
      .from('yearbook_pages')
      .delete()
      .eq('page_number', pageNumber)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting yearbook page:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete yearbook page' },
      { status: 500 }
    )
  }
}
