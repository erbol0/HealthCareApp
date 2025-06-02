import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { Activity, Pill, Brain } from "lucide-react";

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
    <div className="flex flex-col items-start w-full min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Health Status
        </h1>

        {/* Symptoms Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Symptoms</h2>
          </div>
          {symptoms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
              {symptoms.map((symptom) => (
                <Card
                  key={symptom.id}
                  className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardHeader>
                    <CardTitle className="capitalize text-xl bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
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
            <p className="text-muted-foreground p-4 bg-muted rounded-lg">
              No symptoms reported.
            </p>
          )}
        </div>

        {/* Medications */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Pill className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Medications</h2>
          </div>
          {medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
              {medications.map((medication) => (
                <Card
                  key={medication.id}
                  className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardHeader>
                    <CardTitle className="capitalize text-xl bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
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
            <p className="text-muted-foreground p-4 bg-muted rounded-lg">
              No medications reported.
            </p>
          )}
        </div>

        {/* Mental Wellness */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Mental Wellness</h2>
          </div>
          {mentalWellness.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
              {mentalWellness.map((wellness) => (
                <Card
                  key={wellness.id}
                  className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardContent className="pt-6">
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
                  <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-muted-foreground">
                      How are you feeling today?{" "}
                      <span className="font-medium text-foreground bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                        {wellness.happiness}
                      </span>
                    </p>
                    {wellness.anxiety && (
                      <p className="text-muted-foreground italic bg-muted p-2 rounded-md w-full">
                        {wellness.anxiety}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground p-4 bg-muted rounded-lg">
              No mental wellness reported.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthStatusPage;
