import { Institution } from "@/lib/api/public";

export function mapInstitution(ins: any): Institution {
  return {
    _id: ins._id,
    name:
      ins.name ||
      ins.user_id?.name ||
      "Unknown Institution",

    logo:
      ins.logo ||
      ins.user_id?.profilePicture ||
      null,
    bio: ins.bio,
    user_id: ins.user_id,
    status: ins.status,
    location: ins.location ?? "",
    website: ins.website ?? "",
    createdAt: ins.createdAt,
    updatedAt: ins.updatedAt,
    __v: ins.__v
  };
}
