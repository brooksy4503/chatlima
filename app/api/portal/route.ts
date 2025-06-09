import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: "production", // Always use sandbox as per memory
});

export async function GET(request: NextRequest) {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get the Polar customer using external ID (the user's app ID)
        try {
            const customer = await polar.customers.getExternal({
                externalId: userId,
            });

            // Create an authenticated customer portal session
            const customerSession = await polar.customerSessions.create({
                customerId: customer.id,
            });

            // Redirect to the customer portal
            return NextResponse.redirect(customerSession.customerPortalUrl);
        } catch (error) {
            console.error("Error getting Polar customer or creating portal session:", error);

            // If customer not found, return error with helpful message
            if (error instanceof Error && error.message.includes("not found")) {
                return NextResponse.json(
                    { error: "Customer not found. Please contact support." },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: "Failed to access customer portal" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Portal API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 