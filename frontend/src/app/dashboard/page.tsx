import { Recommendations } from "@/components";
import { buttonVariants } from "@/components/ui/button";
import MagicCard from "@/components/ui/magic-card";
import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import {
  BrainIcon,
  HeartPulseIcon,
  NotepadTextIcon,
  StethoscopeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DashboardPage = async () => {
  const user = await currentUser();

  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      symptoms: true,
      medications: true,
      mentalwellness: true,
    },
  });

  const symptoms = await db.symptom.findMany({
    where: {
      userId: user?.id,
    },
  });

  const medications = await db.medication.findMany({
    where: {
      userId: user?.id,
    },
  });
  console.log("dbUser", dbUser);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 w-full gap-6 lg:p-8 relative min-h-screen">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <div className="flex flex-col md:col-span-1 xl:col-span-4 gap-6 w-full relative z-10">
        {/* Profile Card */}
        <div className="group flex flex-col items-center justify-center w-full rounded-xl py-8 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-px rounded-xl bg-white/70 backdrop-blur-xl border border-border/60" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary to-secondary">
              <div className="w-full h-full rounded-full p-0.5 bg-white">
                <Image
                  src={dbUser?.image!}
                  alt={dbUser?.firstName!}
                  width={1024}
                  height={1024}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
            </div>

            <h4 className="text-2xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {dbUser?.firstName} {dbUser?.lastName}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Age: <span className="font-semibold">{dbUser?.age}</span>
            </p>
            <Link
              href="/dashboard/account/settings"
              className={buttonVariants({
                size: "sm",
                className:
                  "mt-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300",
              })}
            >
              Update Profile
            </Link>
          </div>
        </div>

        {/* Information Card */}
        <div className="flex flex-col items-start w-full rounded-xl py-6 px-6 bg-white/70 backdrop-blur-xl border border-border/60 shadow-lg shadow-black/5">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <StethoscopeIcon className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-lg font-bold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
              Medical Information
            </h4>
          </div>

          <ul className="space-y-4 w-full">
            {/* Replace existing list items with enhanced styling */}
            {(
              [
                { label: "Gender", value: dbUser?.gender },
                { label: "Blood Group", value: dbUser?.bloodGroup },
                {
                  label: "Symptoms",
                  value: dbUser?.symptoms
                    ?.map((s) => s.name)
                    .join(", ")
                    .replace(/_/g, " "),
                },
                {
                  label: "Medications",
                  value: dbUser?.medications?.map((m) => m.name).join(", "),
                },
              ] as const
            ).map((item, i) => (
              <li
                key={i}
                className="group flex flex-col space-y-1 p-3 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-medium capitalize">
                  {item.value || "None"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col md:col-span-1 xl:col-span-8 gap-8 w-full relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Enhanced Magic Cards */}
          <MagicCard
            color="rgba(239,68,68,.12)"
            className="border border-red-200/50 hover:border-red-300/50 max-w-full w-full shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300"
          >
            <Link
              href="/dashboard/health-status"
              className="flex items-center justify-between w-full bg-background group p-4"
            >
              <div className="space-y-0.5">
                <h5 className="font-medium font-heading text-red-500">
                  Your health status
                </h5>
                <p className="text-xs text-neutral-600">
                  Evaluate your health status
                </p>
              </div>
              <HeartPulseIcon
                strokeWidth={1.8}
                className="w-8 h-8 text-red-500 group-hover:scale-105 transition transform"
              />
            </Link>
          </MagicCard>

          <MagicCard
            color="rgba(217,70,239,.1)"
            className="border-2 border-fuchsia-100 max-w-full w-full"
          >
            <Link
              href="/dashboard/ai"
              className="flex items-center justify-between w-full group group p-4"
            >
              <div className="space-y-0.5">
                <h5 className="font-medium font-heading text-fuchsia-500">
                  Virtual assistant
                </h5>
                <p className="text-xs text-neutral-600">Chat with our AI bot</p>
              </div>
              <div className="flex">
                <BrainIcon
                  strokeWidth={1.8}
                  className="w-8 h-8 text-fuchsia-500 group-hover:scale-105 transition transform"
                />
              </div>
            </Link>
          </MagicCard>

          <MagicCard
            color="rgba(99,102,241,.08)"
            className="border-2 border-indigo-100 max-w-full w-full"
          >
            <Link
              href="/dashboard/health-tips"
              className="flex items-center justify-between w-full bg-background group p-4"
            >
              <div className="space-y-0.5">
                <h5 className="font-medium font-heading text-indigo-500">
                  Health tips
                </h5>
                <p className="text-xs text-neutral-600">
                  Get health tips and advice
                </p>
              </div>
              <NotepadTextIcon className="w-8 h-8 text-indigo-500 group-hover:scale-105 transition transform" />
            </Link>
          </MagicCard>
        </div>

        {/* Recommendations Section */}
        <div className="flex flex-col items-start w-full space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <NotepadTextIcon className="w-6 h-6" />
            Health Recommendations
          </h3>
          <div className="w-full">
            <Recommendations
              symptoms={symptoms}
              medications={medications}
              user={dbUser!}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
