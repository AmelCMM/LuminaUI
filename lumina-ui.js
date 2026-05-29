import { ensureGlobalStyle } from "./lumina-ui/widgets/utils.js";

ensureGlobalStyle(
  "lumina-global-reset",
  `
*, *::before, *::after {
  box-sizing: border-box;
}
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}
::selection {
  background-color: rgba(37, 99, 235, 0.18);
}
`,
);

export { mount } from "./lumina-ui/core/renderer.js";
export { errorBus } from "./lumina-ui/core/errors.js";
export {
  createState as useState,
  useEffect,
  createStore,
} from "./lumina-ui/core/state.js";
export {
  createElement,
  Fragment,
  applyStyles,
  addClasses,
} from "./lumina-ui/core/element.js";
export {
  createTheme,
  luminaDefaultTheme,
  luminaTheme,
  themeToCssVariables,
} from "./lumina-ui/widgets/utils.js";
export {
  GlobalTheme,
  ThemeProvider,
  ThemeScope,
} from "./lumina-ui/widgets/theme.js";

export {
  Column,
  Row,
  Container,
  Center,
  Align,
  Expanded,
  Flexible,
  Padding,
  SizedBox,
  Spacer,
  Wrap,
  Stack,
  Positioned,
  Divider,
  Card,
  AspectRatio,
  Baseline,
  ConstrainedBox,
  DecoratedBox,
  FractionallySizedBox,
  LayoutBuilder,
  LimitedBox,
  Offstage,
  OverflowBox,
  RotatedBox,
  SizedOverflowBox,
  Transform,
} from "./lumina-ui/widgets/layout.js";
export {
  Button,
  Input,
  TextField,
  Checkbox,
  Switch,
} from "./lumina-ui/widgets/controls.js";
export {
  Badge,
  CircleAvatar,
  ClipRRect,
  Icon,
  Image,
  Placeholder,
  ClipOval,
  ClipPath,
  ClipRect,
  FittedBox,
  Opacity,
  PhysicalModel,
  ShaderMask,
} from "./lumina-ui/widgets/display.js";
export {
  CustomScrollView,
  GridView,
  ListView,
  NestedScrollView,
  PageView,
  SingleChildScrollView,
  SliverAppBar,
  SliverGrid,
  SliverList,
  SliverPadding,
  SliverToBoxAdapter,
} from "./lumina-ui/widgets/scrolling.js";
export {
  AlertDialog,
  CircularProgressIndicator,
  Dialog,
  LinearProgressIndicator,
  ModalBarrier,
  SnackBar,
  Tooltip,
} from "./lumina-ui/widgets/feedback.js";
export {
  Dropdown,
  Form,
  FormField,
  Radio,
  RadioGroup,
  Slider,
  TextArea,
} from "./lumina-ui/widgets/forms.js";
export {
  AppBar,
  BottomNavigationBar,
  Drawer,
  NavigationRail,
  Scaffold,
  TabBar,
  TabBarView,
} from "./lumina-ui/widgets/navigation.js";
export {
  createRouter,
  defaultRouter,
  isRouteActive,
  Link,
  matchPath,
  matchRoute,
  NavLink,
  Router,
  RouteView,
} from "./lumina-ui/widgets/routing.js";
export {
  Menu,
  MenuDivider,
  MenuItem,
  Overlay,
  OverlayEntry,
  Popover,
  PopupMenuButton,
} from "./lumina-ui/widgets/overlay.js";
export {
  DataTable,
  Pagination,
  paginationRange,
  sortRows,
} from "./lumina-ui/widgets/data.js";
export {
  AutoComplete,
  Autocomplete,
  ComboBox,
  filterOptions,
} from "./lumina-ui/widgets/selection.js";
export {
  AnimatedContainer,
  AnimatedOpacity,
  AnimatedScale,
  AnimatedSlide,
  AnimatedSwitcher,
} from "./lumina-ui/widgets/animation.js";
export {
  Text,
  Heading,
  Caption,
  DefaultTextStyle,
  RichText,
} from "./lumina-ui/widgets/text.js";
export {
  Semantics,
  ExcludeSemantics,
} from "./lumina-ui/widgets/accessibility.js";
export {
  AbsorbPointer,
  Dismissible,
  Draggable,
  DragTarget,
  GestureDetector,
  IgnorePointer,
} from "./lumina-ui/widgets/interaction.js";

