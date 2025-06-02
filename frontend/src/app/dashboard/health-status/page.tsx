import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { HeartPulse, AlertCircle, Pill, Smile, Brain } from "lucide-react";

const HealthStatusPage = async () => {
  const user = await currentUser();

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

  const mentalWellness = await db.mentalWellness.findMany({
    where: {
      userId: user?.id,
    },
  });

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full p-2 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <HeartPulse className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Health Status
          </h1>
        </div>

        {/* Symptoms Section */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-100">
              Symptoms
            </h2>
          </div>
          {symptoms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
              {symptoms.map((symptom) => (
                <Card
                  key={symptom.id}
                  className="shadow-lg border border-yellow-100 dark:border-zinc-800 rounded-xl"
                >
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="capitalize text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                      {symptom.name.toLowerCase().replace("_", " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground capitalize">
                      How often:{" "}
                      <span className="font-medium text-foreground">
                        {symptom.frequency.toLowerCase()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      On a scale of 1-10:{" "}
                      <span className="font-medium text-foreground">
                        {symptom.intensity}
                      </span>
                    </p>
                  </CardContent>
                  <CardFooter className="text-muted-foreground gap-1">
                    Reported:{" "}
                    <span className="font-medium text-foreground">
                      {symptom.loggedAt?.toLocaleString()}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No symptoms reported.</p>
          )}
        </div>

        {/* Medications */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-100">
              Medications
            </h2>
          </div>
          {medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
              {medications.map((medication) => (
                <Card
                  key={medication.id}
                  className="shadow-lg border border-purple-100 dark:border-zinc-800 rounded-xl"
                >
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Pill className="w-5 h-5 text-purple-500" />
                    <CardTitle className="capitalize text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                      {medication.name.toLowerCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground capitalize">
                      How often:{" "}
                      <span className="font-medium text-foreground">
                        {medication.frequency.toLowerCase()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Dosage:{" "}
                      <span className="font-medium text-foreground">
                        {medication.dosage}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Purpose:{" "}
                      <span className="font-medium text-foreground">
                        {medication.purpose}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Adherence:{" "}
                      <span className="font-medium text-foreground">
                        {medication.adherence.toLowerCase()}
                      </span>
                    </p>
                  </CardContent>
                  {medication.startDate && (
                    <CardFooter>
                      Started:{" "}
                      <span className="font-medium text-foreground">
                        {medication.startDate?.toLocaleString()}
                      </span>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No medications reported.</p>
          )}
        </div>

        {/* Mental Wellness */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-100">
              Mental Wellness
            </h2>
          </div>
          {mentalWellness.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
              {mentalWellness.map((wellness) => (
                <Card
                  key={wellness.id}
                  className="shadow-lg border border-blue-100 dark:border-zinc-800 rounded-xl"
                >
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Smile className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg font-semibold text-zinc-700 dark:text-zinc-100">
                      Wellness Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground capitalize">
                      Mood:{" "}
                      <span className="font-medium text-foreground">
                        {wellness.mood.toLowerCase()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Sleep:{" "}
                      <span className="font-medium text-foreground">
                        {wellness.sleep.toLowerCase()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Stress:{" "}
                      <span className="font-medium text-foreground">
                        {wellness.stress.toLowerCase()}
                      </span>
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-1">
                    <p className="text-muted-foreground">
                      How are you feeling today?{" "}
                      <span className="font-medium text-foreground">
                        {wellness.happiness}
                      </span>
                    </p>
                    {wellness.anxiety && (
                      <p className="text-muted-foreground">
                        {wellness.anxiety}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No mental wellness reported.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthStatusPage;
