import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";

export default defineEventHandler(async (event) => {
    // Auth check
    const currentUser = requireAdmin(event);

    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: "ID is required",
            data: errorResponse("ID is required", ERROR_CODES.VALIDATION_ERROR),
        });
    }

    // Check if exists
    const testimonial = await prisma.testimonials.findUnique({
        where: { id },
    });

    if (!testimonial) {
        throw createError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            statusMessage: "Testimonial not found",
            data: errorResponse("Testimonial not found", ERROR_CODES.NOT_FOUND),
        });
    }

    // Delete
    await prisma.testimonials.delete({
        where: { id },
    });

    // Log activity
    prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "DELETE_TESTIMONIAL",
            entityType: "TESTIMONIAL",
            entityId: id,
            description: `Admin deleted testimonial from ${testimonial.name}`,
            metadata: { testimonialId: id, name: testimonial.name },
            ipAddress:
                getHeader(event, "x-forwarded-for") ||
                getHeader(event, "x-real-ip") ||
                "0.0.0.0",
            userAgent: getHeader(event, "user-agent") || null,
        },
    }).catch((err) => console.error("Failed to log activity:", err));

    return successResponse(
        null,
        "Testimonial deleted successfully",
    );
});
