import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import {
  UserCircle,
  HeartPulse,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
} from "lucide-react";

const SummaryPage = async () => {
  const user = await currentUser();

  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
  });

  if (!dbUser) {
    return null;
  }

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

  const { age, bloodGroup, height, weight, gender, medicalIssues } = dbUser;

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full p-2 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <HeartPulse className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Health Summary
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
          <Card className="shadow-lg border border-pink-100 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <UserCircle className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Age:{" "}
                <span className="font-medium text-foreground">
                  {age || "N/A"}
                </span>
              </p>
              <p className="text-muted-foreground">
                Gender:{" "}
                <span className="font-medium text-foreground capitalize">
                  {gender || "N/A"}
                </span>
              </p>
              <p className="text-muted-foreground">
                Blood Group:{" "}
                <span className="font-medium text-foreground">
                  {bloodGroup || "N/A"}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-blue-100 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Activity className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                Physical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Height:{" "}
                <span className="font-medium text-foreground">
                  {height || "N/A"} cm
                </span>
              </p>
              <p className="text-muted-foreground">
                Weight:{" "}
                <span className="font-medium text-foreground capitalize">
                  {weight || "N/A"} kg
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-yellow-100 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {symptoms.length > 0 ? (
                <ul className="space-y-2 list-disc pl-4">
                  {symptoms.map((symptom) => (
                    <li key={symptom.id}>
                      <p className="text-muted-foreground capitalize">
                        {symptom.name.toLowerCase()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No symptoms reported.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-purple-100 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Pill className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length > 0 ? (
                <ul className="space-y-2 list-disc pl-4">
                  {medications.map((medication) => (
                    <li key={medication.id}>
                      <p className="text-muted-foreground capitalize">
                        {medication.name.toLowerCase()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No medications reported.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-red-100 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Stethoscope className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                Medical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {medicalIssues || "No medical issuges reported"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
