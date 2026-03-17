import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'report_created' | 'report_assigned' | 'status_changed';
  reportTitle: string;
  reportId: string;
  recipientName: string;
  // Optional fields depending on type
  staffName?: string;
  newStatus?: string;
  oldStatus?: string;
  reporterName?: string;
  description?: string;
  location?: string;
}

function getEmailHtml(data: EmailRequest): string {
  const headerColor = '#1a56db';
  const baseStyle = `
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  `;

  let content = '';

  if (data.type === 'report_created') {
    content = `
      <div style="background: ${headerColor}; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🛣️ New Hazard Report Submitted</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${data.recipientName}</strong>,</p>
        <p style="color: #555; font-size: 15px;">A new hazard report has been submitted and is awaiting review.</p>
        <div style="background: #f0f4ff; border-left: 4px solid ${headerColor}; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 4px 0; color: #333;"><strong>Title:</strong> ${data.reportTitle}</p>
          ${data.description ? `<p style="margin: 4px 0; color: #333;"><strong>Description:</strong> ${data.description}</p>` : ''}
          ${data.location ? `<p style="margin: 4px 0; color: #333;"><strong>Location:</strong> ${data.location}</p>` : ''}
          ${data.reporterName ? `<p style="margin: 4px 0; color: #333;"><strong>Reported by:</strong> ${data.reporterName}</p>` : ''}
        </div>
        <p style="color: #555; font-size: 14px;">Please log in to the dashboard to review and take action.</p>
      </div>
    `;
  } else if (data.type === 'report_assigned') {
    content = `
      <div style="background: #059669; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📋 Report Assigned to You</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${data.recipientName}</strong>,</p>
        <p style="color: #555; font-size: 15px;">A hazard report has been assigned to you for review and resolution.</p>
        <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 4px 0; color: #333;"><strong>Report:</strong> ${data.reportTitle}</p>
          ${data.description ? `<p style="margin: 4px 0; color: #333;"><strong>Description:</strong> ${data.description}</p>` : ''}
          ${data.location ? `<p style="margin: 4px 0; color: #333;"><strong>Location:</strong> ${data.location}</p>` : ''}
        </div>
        <p style="color: #555; font-size: 14px;">Please log in to your dashboard to manage this report.</p>
      </div>
    `;
  } else if (data.type === 'status_changed') {
    const statusColors: Record<string, string> = {
      pending: '#f59e0b',
      under_review: '#3b82f6',
      verified: '#8b5cf6',
      rejected: '#ef4444',
      in_progress: '#f97316',
      resolved: '#10b981',
    };
    const statusColor = statusColors[data.newStatus || ''] || headerColor;
    const statusLabel = (data.newStatus || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    content = `
      <div style="background: ${statusColor}; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Report Status Updated</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${data.recipientName}</strong>,</p>
        <p style="color: #555; font-size: 15px;">The status of your hazard report has been updated.</p>
        <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 4px 0; color: #333;"><strong>Report:</strong> ${data.reportTitle}</p>
          <p style="margin: 4px 0; color: #333;"><strong>New Status:</strong> 
            <span style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px;">${statusLabel}</span>
          </p>
        </div>
        <p style="color: #555; font-size: 14px;">Log in to your dashboard to view full details.</p>
      </div>
    `;
  }

  // Add routing info banner showing original intended recipient
  const routingBanner = `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 0;">
      <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">📬 Email Routing Info (Dev Mode)</p>
      <p style="margin: 4px 0 0; color: #92400e; font-size: 13px;"><strong>Originally intended for:</strong> ${data.to} (${data.recipientName})</p>
      <p style="margin: 4px 0 0; color: #92400e; font-size: 13px;"><strong>Triggered by:</strong> ${data.type === 'report_created' ? 'Citizen submitted a report' : data.type === 'report_assigned' ? 'Admin assigned a report' : 'Status update action'}</p>
    </div>
  `;

  return `
    <div style="${baseStyle}">
      ${routingBanner}
      ${content}
      <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sentinel Road Hazard Management System</p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const body: EmailRequest = await req.json();
    const html = getEmailHtml(body);

    // Dev mode: route all emails to account owner due to Resend free tier
    const DEV_RECIPIENT = 'mamidiram0921@gmail.com';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sentinel Road <onboarding@resend.dev>',
        to: [DEV_RECIPIENT],
        subject: `[To: ${body.recipientName}] ${body.subject}`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      // Resend free tier: can only send to account owner's email
      if (res.status === 403 && result?.message?.includes('testing emails')) {
        console.warn(`Resend free tier: skipped email to ${body.to}. Verify a domain at resend.com/domains to send to any recipient.`);
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'free_tier_restriction', message: 'Email skipped: Resend free tier only allows sending to the account owner email. Verify a domain to unlock full sending.' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('Resend API error:', result);
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
