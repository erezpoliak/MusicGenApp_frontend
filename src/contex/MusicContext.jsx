import { useState } from "react";
import { MusicContext } from "./constants";

export const MusicProvider = ({ children }) => {
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const value = {
    generatedUrl,
    setGeneratedUrl,
    isGenerating,
    setIsGenerating,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};
