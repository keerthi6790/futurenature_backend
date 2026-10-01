import { FastifyReply, FastifyRequest } from "fastify";
import { ZodAddBannerRequestSchema, ZodUpdateBannerRequestSchema } from "./banner.schema";
import prisma from "../../utils/Prisma";
import { uploadToS3 } from "../../utils/s3.utils";

export const formatBanner = (b: any) => {
  if (!b) return b;
  return {
    ...b,
    imageUrl: b.desktopImageUrl || b.mobileImageUrl || "",
  };
};

export const AddBanner = async (
  request: FastifyRequest<{ Body: ZodAddBannerRequestSchema }>,
  reply: FastifyReply
) => {
  const {
    title,
    desktopImageUrl,
    mobileImageUrl,
    desktopHref,
    mobileHref,
    isActive = true,
    order = 0,
  } = request.body;
  const rawDesktop = desktopImageUrl || (request.body as any).imageUrl;
  const rawMobile = mobileImageUrl;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to add a banner (Admin only)",
      });
    }

    if (!rawDesktop && !rawMobile) {
      return reply.code(400).send({
        status: false,
        message: "At least one banner image (desktop or mobile) is required",
      });
    }

    let processedDesktopUrl = rawDesktop || rawMobile;
    if (rawDesktop && (rawDesktop.startsWith("data:image/") || rawDesktop.length > 500)) {
      processedDesktopUrl = await uploadToS3(
        rawDesktop,
        `banner-desktop-${Date.now()}.jpg`
      );
    }

    let processedMobileUrl = rawMobile || null;
    if (rawMobile && (rawMobile.startsWith("data:image/") || rawMobile.length > 500)) {
      processedMobileUrl = await uploadToS3(
        rawMobile,
        `banner-mobile-${Date.now()}.jpg`
      );
    }

    const banner = await (prisma as any).banner.create({
      data: {
        title: title || null,
        desktopImageUrl: processedDesktopUrl || "",
        mobileImageUrl: processedMobileUrl,
        desktopHref: desktopHref || null,
        mobileHref: mobileHref || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order ? Number(order) : 0,
      },
    });

    reply.code(200).send({
      status: true,
      message: "Banner added successfully!",
      data: formatBanner(banner),
    });
  } catch (err: any) {
    console.error("AddBanner error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to add banner",
    });
  }
};

export const UpdateBanner = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: ZodUpdateBannerRequestSchema;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const {
    title,
    desktopImageUrl,
    mobileImageUrl,
    desktopHref,
    mobileHref,
    isActive,
    order,
  } = request.body;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to update a banner (Admin only)",
      });
    }

    const existingBanner = await (prisma as any).banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return reply.code(404).send({
        status: false,
        message: "Banner not found",
      });
    }

    let processedDesktopUrl = existingBanner.desktopImageUrl;
    if (desktopImageUrl) {
      if (desktopImageUrl.startsWith("data:image/") || desktopImageUrl.length > 500) {
        processedDesktopUrl = await uploadToS3(
          desktopImageUrl,
          `banner-desktop-${Date.now()}.jpg`
        );
      } else {
        processedDesktopUrl = desktopImageUrl;
      }
    }

    let processedMobileUrl = existingBanner.mobileImageUrl;
    if (mobileImageUrl !== undefined) {
      if (mobileImageUrl && (mobileImageUrl.startsWith("data:image/") || mobileImageUrl.length > 500)) {
        processedMobileUrl = await uploadToS3(
          mobileImageUrl,
          `banner-mobile-${Date.now()}.jpg`
        );
      } else {
        processedMobileUrl = mobileImageUrl || null;
      }
    }

    const updatedBanner = await (prisma as any).banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title || null }),
        ...(desktopImageUrl !== undefined && { desktopImageUrl: processedDesktopUrl }),
        ...(mobileImageUrl !== undefined && { mobileImageUrl: processedMobileUrl }),
        ...(desktopHref !== undefined && { desktopHref: desktopHref || null }),
        ...(mobileHref !== undefined && { mobileHref: mobileHref || null }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    reply.code(200).send({
      status: true,
      message: "Banner updated successfully!",
      data: updatedBanner,
    });
  } catch (err: any) {
    console.error("UpdateBanner error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to update banner",
    });
  }
};

export const DeleteBanner = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to delete a banner (Admin only)",
      });
    }

    await (prisma as any).banner.delete({
      where: { id },
    });

    reply.code(200).send({
      status: true,
      message: "Banner deleted successfully!",
    });
  } catch (err: any) {
    console.error("DeleteBanner error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to delete banner",
    });
  }
};

export const ListAllBanners = async (
  request: FastifyRequest<{ Querystring: { activeOnly?: string } }>,
  reply: FastifyReply
) => {
  const { activeOnly } = request.query;

  try {
    const banners = await (prisma as any).banner.findMany({
      where: activeOnly === "true" ? { isActive: true } : {},
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    reply.code(200).send({
      status: true,
      data: banners.map(formatBanner),
    });
  } catch (err: any) {
    console.error("ListAllBanners error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to fetch banners",
    });
  }
};

export const ListBannersByDevice = async (
  request: FastifyRequest<{
    Querystring: { device?: string };
    Params: { type?: string };
  }>,
  reply: FastifyReply
) => {
  const deviceType = (request.params.type || request.query.device || "desktop").toLowerCase();
  const isMobile = deviceType === "mobile";

  try {
    const banners = await (prisma as any).banner.findMany({
      where: { isActive: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    const formattedBanners = banners.map((b: any) => {
      const selectedImage = isMobile ? (b.mobileImageUrl || b.desktopImageUrl) : b.desktopImageUrl;
      const selectedHref = isMobile ? (b.mobileHref || b.desktopHref || "") : (b.desktopHref || "");

      return {
        id: b.id,
        title: b.title,
        imageUrl: selectedImage,
        href: selectedHref,
        device: isMobile ? "mobile" : "desktop",
        desktopImageUrl: b.desktopImageUrl,
        mobileImageUrl: b.mobileImageUrl,
        desktopHref: b.desktopHref,
        mobileHref: b.mobileHref,
        isActive: b.isActive,
        order: b.order,
        createdAt: b.createdAt,
      };
    });

    reply.code(200).send({
      status: true,
      device: isMobile ? "mobile" : "desktop",
      data: formattedBanners,
    });
  } catch (err: any) {
    console.error("ListBannersByDevice error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to fetch device banners",
    });
  }
};
