"use client";

import { getHealthTips } from "@/actions";
import { Medication, Symptom, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Lightbulb, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  symptoms: Symptom[];
  medications: Medication[];
  user: User;
}

interface HealthTipSection {
  title: string;
  content: string[];
}

const HealthTips = ({ symptoms, medications, user }: Props) => {
  const [tips, setTips] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutate } = useMutation({
    mutationKey: ["get-tips"],
    mutationFn: async () => {
      setIsLoading(true);
      const res = await getHealthTips({ symptoms, medications, user });
      localStorage.setItem("cura_health_tips", res);
      setTips(res);
      setIsLoading(false);
      return res;
    },
    onError: (error) => {
      setIsLoading(false);
      console.error(error);
      toast.error("Error getting health tips");
    },
    onSuccess: () => {
      setIsLoading(false);
      toast.success("Health tips generated!");
    },
  });

  // TODO: make a refresh button to get new tips
  const handleRefresh = () => {
    mutate();
  };

  useEffect(() => {
    const storedTips = localStorage.getItem("cura_health_tips");
    if (storedTips) {
      setTips(storedTips);
    } else {
      mutate();
    }
  }, [mutate]);

  const parseTips = (markdown: string): HealthTipSection[] => {
    const sections: HealthTipSection[] = [];
    const lines = markdown.split("\n");
    let currentSection: HealthTipSection | null = null;

    lines.forEach((line) => {
      if (line.startsWith("##")) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace("##", "").trim(),
          content: [],
        };
      } else if (line.startsWith("-") && currentSection) {
        currentSection.content.push(line.replace("-", "").trim());
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  return (
    <div className="flex flex-col w-full p-6 rounded-xl border border-border/80 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
            Health Tips
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full py-16">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm animate-pulse" />
            <LoaderIcon className="w-10 h-10 animate-spin text-primary relative" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-4">
            Generating health tips...
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-6">
          {tips ? (
            parseTips(tips).map((section, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-white/50 p-6 transition-all hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <h4 className="text-lg font-semibold text-primary/80 mb-4">
                    {section.title}
                  </h4>

                  <ul className="space-y-2">
                    {section.content.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <AlertCircle className="w-4 h-4 mt-1 text-primary/60 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-3 rounded-full bg-destructive/10 mb-3">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground font-medium text-center">
                No health tips available.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthTips;
