import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/zoho'

// Zoho Creator API (India DC) - Quotations form/report
// App: https://creatorapp.zoho.in/bvkinfrasoftservicespvtltd/machine-master2/#Form:Quotations
const CREATOR_BASE = 'https://www.zohoapis.in/creator/v2.1/data'
const OWNER_NAME = 'bvkinfrasoftservicespvtltd'
const APP_LINK_NAME = 'machine-master2'
const REPORT_LINK_NAME = 'All_Quotations'

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    const { searchParams } = new URL(request.url)

    // Optional: id (from perm), max_records, criteria, field_config, fields, privatelink
    const id = searchParams.get('id') || ''
    const max_records = searchParams.get('max_records') || '200'
    const field_config = searchParams.get('field_config') || 'all'
    const criteriaParam = searchParams.get('criteria') || ''
    const fields = searchParams.get('fields') || ''
    const privatelink = searchParams.get('privatelink') || ''

    // When id is provided (e.g. from perm/URL), filter by that record ID only (ID is NUMBER in Zoho)
    const criteria = id ? `ID == ${id}` : criteriaParam

    const url = new URL(
      `${CREATOR_BASE}/${OWNER_NAME}/${APP_LINK_NAME}/report/${REPORT_LINK_NAME}`
    )
    url.searchParams.set('max_records', max_records)
    url.searchParams.set('field_config', field_config)
    if (criteria) url.searchParams.set('criteria', criteria)
    if (fields) url.searchParams.set('fields', fields)
    if (privatelink) url.searchParams.set('privatelink', privatelink)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Zoho Creator API error', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch Quotations',
      },
      { status: 500 }
    )
  }
}
