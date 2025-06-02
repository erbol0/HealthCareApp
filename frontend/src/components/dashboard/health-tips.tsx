"use client";

import { getHealthTips } from "@/actions";
import { Medication, Symptom, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, RefreshCw, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface Props {
  symptoms: Symptom[];
  medications: Medication[];
  user: User;
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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-6 w-full max-w-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-pink-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              Personalized Health Tips
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow transition"
            title="Refresh Tips"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full min-h-[120px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <LoaderIcon className="w-8 h-8 animate-spin text-pink-500" />
              <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium mt-3">
                Loading health tips...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start w-full h-full">
              {tips ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-pink dark:prose-invert max-w-none text-base leading-relaxed"
                >
                  {tips}
                </ReactMarkdown>
              ) : (
                <p className="text-base text-zinc-400 font-medium text-center w-full py-6">
                  No health tips available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthTips;
