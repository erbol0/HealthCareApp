"use client";

import { getHealthTips } from "@/actions";
import { Medication, Symptom, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { 
  Lightbulb, 
  RefreshCw, 
  Star, 
  Heart, 
  Brain, 
  Activity,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
    symptoms: Symptom[];
    medications: Medication[];
    user: User;
}

interface TipSection {
  category: string;
  icon: JSX.Element;
  tips: string[];
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

    const parseTipsIntoSections = (markdown: string): TipSection[] => {
      const sections: TipSection[] = [];
      const lines = markdown.split('\n').filter(line => line.trim());
      let currentSection: TipSection | null = null;
  
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#')) {
          if (currentSection?.tips.length) sections.push(currentSection);
          currentSection = {
            category: trimmedLine.replace(/#/g, '').trim(),
            icon: getCategoryIcon(trimmedLine),
            tips: []
          };
        } else if (trimmedLine.startsWith('-') && currentSection) {
          currentSection.tips.push(trimmedLine.replace(/^-/, '').trim());
        }
      });
  
      if (currentSection?.tips.length) sections.push(currentSection);
      return sections;
    };
  
    const getCategoryIcon = (category: string) => {
      const c = category.toLowerCase();
      if (c.includes('exercise')) return <Activity className="w-5 h-5" />;
      if (c.includes('mental')) return <Brain className="w-5 h-5" />;
      if (c.includes('health')) return <Heart className="w-5 h-5" />;
      return <Star className="w-5 h-5" />;
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Personalized Health Tips
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2 hover:bg-primary/5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Tips
            </Button>
          </div>
  
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-lg animate-pulse" />
                <Lightbulb className="w-12 h-12 text-primary animate-bounce relative" />
              </div>
              <p className="text-muted-foreground mt-4 font-medium">
                Generating personalized tips...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips ? (
                parseTipsIntoSections(tips).map((section, idx) => (
                  <Card
                    key={idx}
                    className="group hover:shadow-lg transition-all duration-300 border-primary/20"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {section.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          {section.category}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 group/tip">
                            <ArrowRight className="w-4 h-4 mt-1 text-primary/60 group-hover/tip:text-primary transition-colors" />
                            <span className="text-muted-foreground group-hover/tip:text-foreground transition-colors">
                              {tip}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">
                    No health tips available. Click refresh to generate new tips.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
    )
};

export default HealthTips;
