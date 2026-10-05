"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "../store/slices/themeSlice";

export default function ThemeBridge() {
  const mode = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return null;
}
