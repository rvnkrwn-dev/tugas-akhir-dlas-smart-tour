import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";

// Validation schema
const updateSchema = z.object({
    status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional(),
    isPublished: z.boolean().optional(),
});

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

    // Parse body
    const body = await readBody(event);
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: "Validation failed",
            data: errorResponse("Invalid update data", ERROR_CODES.VALIDATION_ERROR),
        });
    }

    const { status, isPublished } = validation.data;

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

    // Update
    const updatedTestimonial = await prisma.testimonials.update({
        where: { id },
        data: {
            ...(status ? { status } : {}),
            ...(isPublished !== undefined ? { isPublished } : {}),
        },
    });

    // Log activity
    prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "UPDATE_TESTIMONIAL",
            entityType: "TESTIMONIAL",
            entityId: id,
            description: `Admin updated testimonial ${testimonial.name}`,
            metadata: {
                testimonialId: id,
                changes: { status, isPublished }
            },
            ipAddress:
                getHeader(event, "x-forwarded-for") ||
                getHeader(event, "x-real-ip") ||
                "0.0.0.0",
            userAgent: getHeader(event, "user-agent") || null,
        },
    }).catch((err) => console.error("Failed to log activity:", err));

    return successResponse(
        updatedTestimonial,
        "Testimonial updated successfully",
    );
});
