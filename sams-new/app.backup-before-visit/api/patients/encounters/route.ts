import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
      const body = await request.json();

          const encounter = await prisma.clinicalEncounter.create({
                data: {
                        patientId: Number(body.patientId),
                                chiefComplaint: body.chiefComplaint || null,
                                        diagnosis: body.diagnosis || null,
                                                clinicalNotes: body.clinicalNotes || null,
                                                        treatmentPlan: body.treatmentPlan || null,
                                                                followUpDate: body.followUpDate
                                                                          ? new Date(body.followUpDate)
                                                                                    : null,
                                                                                          },
                                                                                              });

                                                                                                  return NextResponse.json(encounter, { status: 201 });
                                                                                                    } catch (error) {
                                                                                                        console.error("Clinical encounter error:", error);

                                                                                                            return NextResponse.json(
                                                                                                                  { error: "Failed to create clinical encounter" },
                                                                                                                        { status: 500 }
                                                                                                                            );
                                                                                                                              }
                                                                                                                              }