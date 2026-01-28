import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Calculate tomorrow's date
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split('T')[0]

        // Fetch events for tomorrow
        const { data: events, error: eventsError } = await supabaseClient
            .from('tasks')
            .select('id, title, time, location')
            .eq('date', dateStr)

        if (eventsError) throw eventsError

        console.log(`Found ${events.length} events for tomorrow (${dateStr})`)

        const results = []

        for (const event of events) {
            // Fetch approved volunteers for this event
            const { data: assignments, error: assignError } = await supabaseClient
                .from('task_assignments')
                .select('volunteer_id, status')
                .eq('task_id', event.id)
                .eq('status', 'approved')

            if (assignError) {
                console.error(`Error fetching assignments for event ${event.id}:`, assignError)
                continue
            }

            if (!assignments?.length) continue

            // For each volunteer, fetch email
            for (const assignment of assignments) {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('email, full_name')
                    .eq('user_id', assignment.volunteer_id)
                    .single()

                if (profile?.email) {
                    console.log(`[Mock] Sending reminder to ${profile.email} for event ${event.title}`)
                    // Logic to use Resend or SMTP would go here
                    // await resend.emails.send({ ... })
                    results.push({ email: profile.email, event: event.title })
                }
            }
        }

        return new Response(
            JSON.stringify({ message: `Processed ${results.length} reminders`, details: results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
