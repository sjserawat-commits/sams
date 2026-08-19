"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Billing UI was updated to validate service details before sending the request.
// This prevents the previous "Enter service, quantity and valid rate" error when
// the user only selected a category such as PROCEDURE without entering its name/rate.

