import { createContext, useContext, useEffect, useState } from "react";
import Config from '../data/Config.json';
import type { TitleContextValue } from "./ContextTypes";

const TitleContext = createContext<TitleContextValue | null>(null);

export function TitleProvider({ children, suffixTitle = Config.WEBSITE_NAME }: { children: React.ReactNode, suffixTitle?: string }) {
    const [title, setTitle] = useState(suffixTitle);

    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <TitleContext.Provider value={{ setTitle }}>
            {children}
        </TitleContext.Provider>
    );
}

export function usePageTitle(title) {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    // setTitle(title);
    if (title) {
      setTitle(`${title} - ${Config.WEBSITE_NAME}`);
    } else {
      setTitle(Config.WEBSITE_NAME);
    }
  }, [title, setTitle]);
}