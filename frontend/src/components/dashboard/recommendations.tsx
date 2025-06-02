"use client";

import { getRecommendations } from "@/actions";
import { Medication, Symptom, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { ClipboardList, LoaderIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  symptoms: Symptom[];
  medications: Medication[];
  user: User;
}

const Recommendations = ({ symptoms, medications, user }: Props) => {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutate } = useMutation({
    mutationKey: ["get-tips"],
    mutationFn: async () => {
      setIsLoading(true);
      const res = await getRecommendations({ symptoms, medications, user });
      localStorage.setItem("cura_health_recommendations", res);
      setRecommendations(res);
      setIsLoading(false);
      return res;
    },
    onError: (error) => {
      setIsLoading(false);
      setError("Error getting health tips");
    },
    onSuccess: () => {
      setError(null);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const storedTips = localStorage.getItem("cura_health_recommendations");
    if (storedTips) {
      setRecommendations(storedTips);
    } else {
      mutate();
    }
  }, [mutate]);

  return (
    <div className="flex flex-col w-full p-6 rounded-xl border border-border/80 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="p-2 rounded-lg bg-primary/10">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
          Personal Health Recommendations
        </h3>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full py-16">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm animate-pulse" />
            <LoaderIcon className="w-10 h-10 animate-spin text-primary relative" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-4">
            Analyzing your health data...
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {recommendations ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-primary/80 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-primary/90"
            >
              {recommendations}
            </ReactMarkdown>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-3 rounded-full bg-destructive/10 mb-3">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground font-medium text-center">
                {error || "No recommendations available at the moment"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
