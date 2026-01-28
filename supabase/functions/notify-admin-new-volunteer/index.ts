import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyAdminRequest {
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { volunteerName, volunteerEmail, volunteerPhone }: NotifyAdminRequest = await req.json();

    const adminEmail = "afifjouili@hotmail.com";

    const emailResponse = await resend.emails.send({
      from: "I-Volunteer <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "🔔 Nouvelle inscription bénévole en attente d'approbation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Nouvelle inscription bénévole</h1>
          <p>Un nouveau bénévole vient de s'inscrire et attend votre approbation :</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom complet :</strong> ${volunteerName}</p>
            <p><strong>Email :</strong> ${volunteerEmail}</p>
            ${volunteerPhone ? `<p><strong>Téléphone :</strong> ${volunteerPhone}</p>` : ''}
          </div>
          
          <p>Veuillez vous connecter au tableau de bord administrateur pour réviser et approuver cette inscription.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Cet email a été envoyé automatiquement par la plateforme I-Volunteer.
          </p>
        </div>
      `,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-admin-new-volunteer function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
