// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";

// export async function PATCH(req: Request, { params }: any) {
//   try {
//     const { status } = await req.json();

//     const client = await clientPromise;
//     const db = client.db();

//     await db.collection("users").updateOne(
//       { _id: new ObjectId(params.id) },
//       {
//         $set: {
//           kycStatus: status,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to update status" },
//       { status: 500 },
//     );
//   }
// }
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status, reason } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    // ফ্রড লজিক নির্ধারণ
    const isMarkingFraud = status.toLowerCase() === "fraud";

    const updateFields: any = {
      kycStatus: status,
      updatedAt: new Date(),
    };

    if (isMarkingFraud) {
      updateFields.accountStatus = "fraud";
      updateFields.walletFrozen = true;
      updateFields.fraudInfo = {
        isFraud: true,
        reason: reason || "Flagged for fraudulent activity",
        markedBy: session.user.email,
        markedAt: new Date(),
      };
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: isMarkingFraud ? "User restricted as fraud" : "Status updated",
    });
  } catch (error: any) {
    console.error("API_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
