import { supabase } from '@/integrations/supabase/client';

interface SendEmailParams {
  to: string;
  subject: string;
  type: 'report_created' | 'report_assigned' | 'status_changed';
  reportTitle: string;
  reportId: string;
  recipientName: string;
  staffName?: string;
  newStatus?: string;
  oldStatus?: string;
  reporterName?: string;
  description?: string;
  location?: string;
}

export async function sendReportEmail(params: SendEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-report-email', {
      body: params,
    });

    if (error) {
      console.error('Email notification failed:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Email notification error:', err);
    return false;
  }
}
