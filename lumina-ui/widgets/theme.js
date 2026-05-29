import {
  cleanStyle,
  createTheme,
  luminaDefaultTheme,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
  themeToCssVariables,
  upsertGlobalStyle,
} from "./utils.js";

export {
  createTheme,
  luminaDefaultTheme,
  themeToCssVariables,
} from "./utils.js";

export function ThemeProvider(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    as = "div",
    theme = {},
    name,
    applySurface = false,
    cssVariables = true,
    style = {},
  } = props;

  return {
    tag: as,
    props: {
      ...omitProps(props, [
        "as",
        "theme",
        "name",
        "applySurface",
        "cssVariables",
      ]),
      "data-lumina-theme": name || undefined,
      style: cleanStyle({
        ...(cssVariables ? themeToCssVariables(theme) : {}),
        color: luminaTheme.colors.text,
        backgroundColor: applySurface ? luminaTheme.colors.surface : undefined,
        ...style,
      }),
    },
    children,
    key: props.key,
  };
}

export const ThemeScope = ThemeProvider;

export function GlobalTheme({
  theme = {},
  selector = ":root",
  id = "lumina-global-theme",
} = {}) {
  const variables = themeToCssVariables(theme);
  const css = `${selector} {\n${Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")}\n}`;

  upsertGlobalStyle(id, css);
  return null;
}
