import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useLocation, Link, useNavigate, useSearchParams, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as React from "react";
import { useState, useEffect } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, Film, Search, Star, ArrowLeft, ChevronDown, Calendar, Clock, Play } from "lucide-react";
import classNames from "classnames";
import { useColorScheme } from "@dazl/color-scheme/react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast$1({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast: toast$1,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const viewport = "_viewport_15mn9_1";
const toast = "_toast_15mn9_16";
const destructive = "_destructive_15mn9_53";
const close = "_close_15mn9_58";
const title$5 = "_title_15mn9_93";
const description$1 = "_description_15mn9_98";
const icon$1 = "_icon_15mn9_101";
const styles$8 = {
  viewport,
  toast,
  destructive,
  close,
  title: title$5,
  description: description$1,
  icon: icon$1
};
const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = ({ className, ...props }) => /* @__PURE__ */ jsx(ToastPrimitive.Viewport, { className: classNames(styles$8.viewport, className), ...props });
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;
const Toast = ({ className, variant = "default", ...props }) => /* @__PURE__ */ jsx(
  ToastPrimitive.Root,
  {
    className: classNames(styles$8.toast, variant === "destructive" && styles$8.destructive, className),
    ...props
  }
);
Toast.displayName = ToastPrimitive.Root.displayName;
ToastPrimitive.Action.displayName;
const ToastClose = ({ className, ...props }) => /* @__PURE__ */ jsx(ToastPrimitive.Close, { className: classNames(styles$8.close, className), "toast-close": "", ...props, children: /* @__PURE__ */ jsx(X, { className: styles$8.icon }) });
ToastClose.displayName = ToastPrimitive.Close.displayName;
const ToastTitle = ({ className, ...props }) => /* @__PURE__ */ jsx(ToastPrimitive.Title, { className: classNames(styles$8.title, className), ...props });
ToastTitle.displayName = ToastPrimitive.Title.displayName;
const ToastDescription = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(ToastPrimitive.Description, { className: classNames(styles$8.description, className), ...props });
ToastDescription.displayName = ToastPrimitive.Description.displayName;
const container$5 = "_container_1pblw_1";
const styles$7 = {
  container: container$5
};
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title: title2, description: description2, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$7.container, children: [
          title2 && /* @__PURE__ */ jsx(ToastTitle, { children: title2 }),
          description2 && /* @__PURE__ */ jsx(ToastDescription, { children: description2 })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const colorSchemeApi = "data:text/javascript;base64,ZnVuY3Rpb24gaW5pdGlhdGVDb2xvclNjaGVtZSh7IHNhdmVDb25maWcsIGxvYWRDb25maWcsIGNzc0NsYXNzIH0pIHsKICAgIGNvbnN0IHN0YXRlID0gewogICAgICAgIGxpc3RlbmVyczogbmV3IFNldCgpLAogICAgICAgIGNvbmZpZzogbG9hZENvbmZpZygpLAogICAgfTsKICAgIGNvbnN0IGlzRGFya1F1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKTsKICAgIGNvbnN0IHJlc29sdmVTeXN0ZW0gPSAoKSA9PiAoaXNEYXJrUXVlcnkubWF0Y2hlcyA/ICdkYXJrJyA6ICdsaWdodCcpOwogICAgY29uc3Qgb25TeXN0ZW1DaGFuZ2UgPSAoKSA9PiB7CiAgICAgICAgaWYgKHN0YXRlLmNvbmZpZyAhPT0gJ3N5c3RlbScpCiAgICAgICAgICAgIHJldHVybjsKICAgICAgICB1cGRhdGVEb2N1bWVudCgpOwogICAgfTsKICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9ICgpID0+IHsKICAgICAgICBjb25zdCBjb25maWcgPSBzdGF0ZS5jb25maWc7CiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBjb25maWcgPT09ICdzeXN0ZW0nID8gcmVzb2x2ZVN5c3RlbSgpIDogY29uZmlnOwogICAgICAgIHJldHVybiB7IGNvbmZpZywgcmVzb2x2ZWQgfTsKICAgIH07CiAgICBjb25zdCB1cGRhdGVEb2N1bWVudCA9ICgpID0+IHsKICAgICAgICBjb25zdCBjdXJyZW50ID0gY3VycmVudFN0YXRlKCk7CiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsKICAgICAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MubGlnaHQsIGNzc0NsYXNzLmRhcmspOwogICAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZChjc3NDbGFzc1tjdXJyZW50LnJlc29sdmVkXSk7CiAgICAgICAgcm9vdC5zdHlsZS5jb2xvclNjaGVtZSA9IGN1cnJlbnQucmVzb2x2ZWQgPT09ICdkYXJrJyA/ICdkYXJrJyA6ICdsaWdodCc7CiAgICAgICAgc3RhdGUubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihjdXJyZW50KSk7CiAgICB9OwogICAgLy8gc2V0IGluaXRpYWwgY29sb3Igc2NoZW1lIGFuZCBsaXN0ZW4gZm9yIHN5c3RlbSBjaGFuZ2VzCiAgICB1cGRhdGVEb2N1bWVudCgpOwogICAgaXNEYXJrUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25TeXN0ZW1DaGFuZ2UpOwogICAgcmV0dXJuIHsKICAgICAgICBnZXQgY29uZmlnKCkgewogICAgICAgICAgICByZXR1cm4gc3RhdGUuY29uZmlnOwogICAgICAgIH0sCiAgICAgICAgc2V0IGNvbmZpZyhjb25maWcpIHsKICAgICAgICAgICAgaWYgKGNvbmZpZyA9PT0gc3RhdGUuY29uZmlnKQogICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICBzdGF0ZS5jb25maWcgPSBjb25maWc7CiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50KCk7CiAgICAgICAgICAgIHNhdmVDb25maWcoY29uZmlnKTsKICAgICAgICB9LAogICAgICAgIGdldCBjdXJyZW50U3RhdGUoKSB7CiAgICAgICAgICAgIHJldHVybiBjdXJyZW50U3RhdGUoKTsKICAgICAgICB9LAogICAgICAgIGdldCByZXNvbHZlZFN5c3RlbSgpIHsKICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVTeXN0ZW0oKTsKICAgICAgICB9LAogICAgICAgIGdldFJvb3RDc3NDbGFzcyhyZXNvbHZlZCA9IGN1cnJlbnRTdGF0ZSgpLnJlc29sdmVkKSB7CiAgICAgICAgICAgIHJldHVybiBjc3NDbGFzc1tyZXNvbHZlZF07CiAgICAgICAgfSwKICAgICAgICBzdWJzY3JpYmU6IChzdWIpID0+IHsKICAgICAgICAgICAgc3RhdGUubGlzdGVuZXJzLmFkZChzdWIpOwogICAgICAgICAgICByZXR1cm4gKCkgPT4gewogICAgICAgICAgICAgICAgc3RhdGUubGlzdGVuZXJzLmRlbGV0ZShzdWIpOwogICAgICAgICAgICB9OwogICAgICAgIH0sCiAgICAgICAgZGlzcG9zZTogKCkgPT4gewogICAgICAgICAgICBzdGF0ZS5saXN0ZW5lcnMuY2xlYXIoKTsKICAgICAgICAgICAgaXNEYXJrUXVlcnkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25TeXN0ZW1DaGFuZ2UpOwogICAgICAgIH0sCiAgICB9Owp9CmNvbnN0IHN0b3JhZ2VLZXkgPSAnY29sb3Itc2NoZW1lJzsKY29uc3Qgc2NyaXB0RGF0YXNldCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ/LmRhdGFzZXQ7CmNvbnN0IGRhcmtDc3NDbGFzcyA9IHNjcmlwdERhdGFzZXQ/LmRhcmtDbGFzcyB8fCAnZGFyay10aGVtZSc7CmNvbnN0IGxpZ2h0Q3NzQ2xhc3MgPSBzY3JpcHREYXRhc2V0Py5saWdodENsYXNzIHx8ICdsaWdodC10aGVtZSc7CndpbmRvdy5jb2xvclNjaGVtZUFwaSA/Pz0gaW5pdGlhdGVDb2xvclNjaGVtZSh7CiAgICBsb2FkQ29uZmlnKCkgewogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpOwogICAgICAgICAgICByZXR1cm4gY29uZmlnID09PSAnbGlnaHQnIHx8IGNvbmZpZyA9PT0gJ2RhcmsnID8gY29uZmlnIDogJ3N5c3RlbSc7CiAgICAgICAgfQogICAgICAgIGNhdGNoIHsKICAgICAgICAgICAgcmV0dXJuICdzeXN0ZW0nOwogICAgICAgIH0KICAgIH0sCiAgICBzYXZlQ29uZmlnKGNvbmZpZykgewogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGlmIChjb25maWcgPT09ICdzeXN0ZW0nKSB7CiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShzdG9yYWdlS2V5KTsKICAgICAgICAgICAgfQogICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIGNvbmZpZyk7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgY2F0Y2ggewogICAgICAgICAgICAvLyBGYWxsYmFjayB0byBuby1vcCBpZiBsb2NhbFN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZQogICAgICAgIH0KICAgIH0sCiAgICBjc3NDbGFzczogeyBsaWdodDogbGlnaHRDc3NDbGFzcywgZGFyazogZGFya0Nzc0NsYXNzIH0sCn0pOwo=";
const favicon = "/favicon.svg";
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "icon",
  href: favicon,
  type: "image/svg+xml"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  const {
    rootCssClass,
    resolvedScheme
  } = useColorScheme();
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    suppressHydrationWarning: true,
    className: rootCssClass,
    style: {
      colorScheme: resolvedScheme
    },
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx("script", {
        src: colorSchemeApi
      }), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(Toaster, {}), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details2 = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details2 = error.status === 404 ? "The requested page could not be found." : error.statusText || details2;
  }
  return /* @__PURE__ */ jsxs("main", {
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details2
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const header$3 = "_header_x2pi9_1";
const container$4 = "_container_x2pi9_10";
const logo = "_logo_x2pi9_19";
const logoIcon = "_logoIcon_x2pi9_33";
const nav = "_nav_x2pi9_39";
const navLink = "_navLink_x2pi9_45";
const active$1 = "_active_x2pi9_58";
const actions$1 = "_actions_x2pi9_73";
const searchContainer = "_searchContainer_x2pi9_79";
const searchInput = "_searchInput_x2pi9_83";
const searchIcon = "_searchIcon_x2pi9_106";
const profile = "_profile_x2pi9_117";
const profileImage = "_profileImage_x2pi9_131";
const styles$6 = {
  header: header$3,
  container: container$4,
  logo,
  logoIcon,
  nav,
  navLink,
  active: active$1,
  actions: actions$1,
  searchContainer,
  searchInput,
  searchIcon,
  profile,
  profileImage
};
function Header({ className, onSearch }) {
  const location = useLocation();
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query2 = formData.get("search");
    if (query2 && onSearch) {
      onSearch(query2);
    }
  };
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  return /* @__PURE__ */ jsx("header", { className: classNames(styles$6.header, className), children: /* @__PURE__ */ jsxs("div", { className: styles$6.container, children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: styles$6.logo, children: [
      /* @__PURE__ */ jsx(Film, { className: styles$6.logoIcon }),
      "TG Mov"
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: styles$6.nav, children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: classNames(styles$6.navLink, { [styles$6.active]: isActive("/") }), children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/series", className: classNames(styles$6.navLink, { [styles$6.active]: isActive("/series") }), children: "Series" }),
      /* @__PURE__ */ jsx(Link, { to: "/movies", className: classNames(styles$6.navLink, { [styles$6.active]: isActive("/movies") }), children: "Movies" }),
      /* @__PURE__ */ jsx(Link, { to: "/kids", className: classNames(styles$6.navLink, { [styles$6.active]: isActive("/kids") }), children: "Kids" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$6.actions, children: [
      /* @__PURE__ */ jsxs("form", { className: styles$6.searchContainer, onSubmit: handleSearchSubmit, children: [
        /* @__PURE__ */ jsx(Search, { className: styles$6.searchIcon }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            name: "search",
            placeholder: "Search movies...",
            className: styles$6.searchInput,
            "aria-label": "Search movies and series"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$6.profile, children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          alt: "User profile",
          className: styles$6.profileImage
        }
      ) })
    ] })
  ] }) });
}
const card = "_card_1pxra_1";
const overlay$1 = "_overlay_1pxra_17";
const poster$1 = "_poster_1pxra_21";
const title$4 = "_title_1pxra_40";
const metadata$1 = "_metadata_1pxra_47";
const year$1 = "_year_1pxra_55";
const rating$1 = "_rating_1pxra_59";
const ratingIcon$1 = "_ratingIcon_1pxra_66";
const styles$5 = {
  card,
  overlay: overlay$1,
  poster: poster$1,
  title: title$4,
  metadata: metadata$1,
  year: year$1,
  rating: rating$1,
  ratingIcon: ratingIcon$1
};
function ContentCard({ content: content2, className }) {
  return /* @__PURE__ */ jsxs(Link, { to: `/${content2.type}/${content2.id}`, className: classNames(styles$5.card, className), children: [
    /* @__PURE__ */ jsx("img", { src: content2.posterUrl, alt: content2.title, className: styles$5.poster }),
    /* @__PURE__ */ jsxs("div", { className: styles$5.overlay, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$5.title, children: content2.title }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.metadata, children: [
        /* @__PURE__ */ jsx("span", { className: styles$5.year, children: content2.year }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.rating, children: [
          /* @__PURE__ */ jsx(Star, { className: styles$5.ratingIcon }),
          content2.rating
        ] })
      ] })
    ] })
  ] });
}
const section = "_section_dtcxg_1";
const header$2 = "_header_dtcxg_5";
const title$3 = "_title_dtcxg_13";
const viewAll = "_viewAll_dtcxg_19";
const scrollContainer = "_scrollContainer_dtcxg_30";
const grid$2 = "_grid_dtcxg_35";
const styles$4 = {
  section,
  header: header$2,
  title: title$3,
  viewAll,
  scrollContainer,
  grid: grid$2
};
function ContentRow({ title: title2, items, viewAllLink, className }) {
  return /* @__PURE__ */ jsxs("section", { className: classNames(styles$4.section, className), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$4.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$4.title, children: title2 }),
      viewAllLink && /* @__PURE__ */ jsx(Link, { to: viewAllLink, className: styles$4.viewAll, children: "View All" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$4.scrollContainer, children: /* @__PURE__ */ jsx("div", { className: styles$4.grid, children: items.map((item) => /* @__PURE__ */ jsx(ContentCard, { content: item }, item.id)) }) })
  ] });
}
const OMDB_API_KEY = "6fca14f0";
const OMDB_BASE_URL = "http://www.omdbapi.com/";
async function searchMovies(query2, page = 1) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query2)}&page=${page}`
    );
    const data = await response.json();
    if (data.Response === "True") {
      return data.Search;
    }
    return [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}
async function getMovieDetails(imdbId) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );
    const data = await response.json();
    if (data.Response === "True") {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}
async function getSeasonDetails(imdbId, season) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&Season=${season}`
    );
    const data = await response.json();
    if (data.Response === "True" && data.Episodes) {
      return data.Episodes;
    }
    return [];
  } catch (error) {
    console.error("Error fetching season details:", error);
    return [];
  }
}
const container$3 = "_container_7sn5r_1";
const main$3 = "_main_7sn5r_6";
const styles$3 = {
  container: container$3,
  main: main$3
};
function meta$3({}) {
  return [{
    title: "Movie Hub - Stream Movies & Series"
  }, {
    name: "description",
    content: "Browse and stream your favorite movies and series"
  }];
}
async function loader$2() {
  const [action, comedy, drama, scifi] = await Promise.all([searchMovies("action"), searchMovies("comedy"), searchMovies("drama"), searchMovies("star wars")]);
  return {
    actionMovies: action.slice(0, 10),
    comedyMovies: comedy.slice(0, 10),
    dramaMovies: drama.slice(0, 10),
    scifiMovies: scifi.slice(0, 10)
  };
}
const home = UNSAFE_withComponentProps(function Home({
  loaderData
}) {
  const navigate = useNavigate();
  const {
    actionMovies,
    comedyMovies,
    dramaMovies,
    scifiMovies
  } = loaderData;
  const handleSearch = (query2) => {
    navigate(`/search?q=${encodeURIComponent(query2)}`);
  };
  const convertToContent = (movies) => {
    return movies.map((movie) => ({
      id: movie.imdbID,
      title: movie.Title,
      description: movie.Plot || "No description available",
      genre: movie.Genre ? movie.Genre.split(", ") : [],
      year: parseInt(movie.Year) || 2024,
      rating: parseFloat(movie.imdbRating) || 0,
      type: movie.Type === "movie" ? "movie" : "series",
      category: "popular",
      posterUrl: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/400x600/333/999?text=No+Poster",
      backdropUrl: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/1920x1080/333/999?text=No+Image"
    }));
  };
  return /* @__PURE__ */ jsxs("div", {
    className: styles$3.container,
    children: [/* @__PURE__ */ jsx(Header, {
      onSearch: handleSearch
    }), /* @__PURE__ */ jsxs("main", {
      className: styles$3.main,
      children: [actionMovies.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
        title: "Action Movies",
        items: convertToContent(actionMovies)
      }), comedyMovies.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
        title: "Comedy Movies",
        items: convertToContent(comedyMovies)
      }), dramaMovies.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
        title: "Drama Movies",
        items: convertToContent(dramaMovies)
      }), scifiMovies.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
        title: "Sci-Fi Movies",
        items: convertToContent(scifiMovies)
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  loader: loader$2,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const container$2 = "_container_gwro2_1";
const main$2 = "_main_gwro2_6";
const header$1 = "_header_gwro2_12";
const title$2 = "_title_gwro2_16";
const query = "_query_gwro2_22";
const subtitle$1 = "_subtitle_gwro2_26";
const grid$1 = "_grid_gwro2_32";
const empty$1 = "_empty_gwro2_38";
const styles$2 = {
  container: container$2,
  main: main$2,
  header: header$1,
  title: title$2,
  query,
  subtitle: subtitle$1,
  grid: grid$1,
  empty: empty$1
};
function meta$2({
  location
}) {
  const searchParams = new URLSearchParams(location.search);
  const query2 = searchParams.get("q") || "";
  return [{
    title: `Search: ${query2} - Movie Hub`
  }, {
    name: "description",
    content: `Search results for ${query2}`
  }];
}
async function loader$1({
  request
}) {
  const url = new URL(request.url);
  const query2 = url.searchParams.get("q") || "";
  if (!query2) {
    return {
      results: [],
      query: ""
    };
  }
  const results = await searchMovies(query2);
  return {
    results,
    query: query2
  };
}
const search = UNSAFE_withComponentProps(function SearchPage({
  loaderData
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query2 = searchParams.get("q") || "";
  const {
    results
  } = loaderData;
  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };
  const convertToContent = (movies) => {
    return movies.map((movie) => ({
      id: movie.imdbID,
      title: movie.Title,
      description: movie.Plot || "No description available",
      genre: movie.Genre ? movie.Genre.split(", ") : [],
      year: parseInt(movie.Year) || 2024,
      rating: parseFloat(movie.imdbRating) || 0,
      type: movie.Type === "movie" ? "movie" : "series",
      category: "popular",
      posterUrl: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/400x600/333/999?text=No+Poster",
      backdropUrl: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/1920x1080/333/999?text=No+Image"
    }));
  };
  const contentResults = convertToContent(results);
  return /* @__PURE__ */ jsxs("div", {
    className: styles$2.container,
    children: [/* @__PURE__ */ jsx(Header, {
      onSearch: handleSearch
    }), /* @__PURE__ */ jsxs("main", {
      className: styles$2.main,
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles$2.header,
        children: [/* @__PURE__ */ jsxs("h1", {
          className: styles$2.title,
          children: ["Search results for ", /* @__PURE__ */ jsxs("span", {
            className: styles$2.query,
            children: ['"', query2, '"']
          })]
        }), /* @__PURE__ */ jsxs("p", {
          className: styles$2.subtitle,
          children: [contentResults.length, " results found"]
        })]
      }), contentResults.length > 0 ? /* @__PURE__ */ jsx("div", {
        className: styles$2.grid,
        children: contentResults.map((item) => /* @__PURE__ */ jsx(ContentCard, {
          content: item
        }, item.id))
      }) : /* @__PURE__ */ jsx("div", {
        className: styles$2.empty,
        children: query2 ? "No results found. Try a different search term." : "Enter a search term to find content"
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: search,
  loader: loader$1,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const moviesData = [
  {
    id: "the-boys",
    title: "The Boys",
    description: `It's the powerless against the super powerful as The Boys embark on a heroic quest to expose the truth about "The Seven," and their formidable Vought backing.`,
    genre: ["Action", "Drama", "Sci-Fi"],
    year: 2022,
    rating: 9.3,
    type: "series",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    featured: true
  },
  {
    id: "inception",
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genre: ["Action", "Sci-Fi", "Thriller"],
    year: 2010,
    rating: 8.8,
    type: "movie",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop",
    featured: true
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    description: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future.",
    genre: ["Crime", "Drama", "Thriller"],
    year: 2008,
    rating: 9.5,
    type: "series",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1574267432644-f610cab5e5e0?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1574267432644-f610cab5e5e0?w=1920&h=1080&fit=crop",
    featured: true
  },
  {
    id: "interstellar",
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces environmental collapse.",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    year: 2014,
    rating: 8.6,
    type: "movie",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
    featured: true
  },
  {
    id: "it",
    title: "IT",
    description: "A group of young kids face their biggest fears when they square off against an evil clown named Pennywise, whose history of murder and violence dates back for centuries.",
    genre: ["Horror", "Thriller"],
    year: 2017,
    rating: 7.3,
    type: "movie",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&h=1080&fit=crop"
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    genre: ["Sci-Fi", "Horror", "Drama"],
    year: 2016,
    rating: 8.7,
    type: "series",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1920&h=1080&fit=crop"
  },
  {
    id: "squid-game",
    title: "Squid Game",
    description: "Hundreds of cash-strapped contestants accept an invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
    genre: ["Thriller", "Drama", "Action"],
    year: 2021,
    rating: 8,
    type: "series",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1920&h=1080&fit=crop"
  },
  {
    id: "sicario",
    title: "Sicario",
    description: "An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs at the border area between the U.S. and Mexico.",
    genre: ["Action", "Crime", "Thriller"],
    year: 2015,
    rating: 7.6,
    type: "movie",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=1080&fit=crop"
  },
  {
    id: "dune",
    title: "Dune",
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    year: 2021,
    rating: 8,
    type: "movie",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
  },
  {
    id: "the-witcher",
    title: "The Witcher",
    description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    genre: ["Fantasy", "Action", "Adventure"],
    year: 2019,
    rating: 8.2,
    type: "series",
    category: "popular",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop"
  },
  {
    id: "frozen",
    title: "Frozen",
    description: "When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man to break the spell.",
    genre: ["Animation", "Adventure", "Comedy"],
    year: 2013,
    rating: 7.4,
    type: "movie",
    category: "kids",
    posterUrl: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&h=1080&fit=crop"
  },
  {
    id: "moana",
    title: "Moana",
    description: "In Ancient Polynesia, when a terrible curse incurred by the Demigod Maui reaches Moana's island, she answers the Ocean's call to seek out the Demigod to set things right.",
    genre: ["Animation", "Adventure", "Comedy"],
    year: 2016,
    rating: 7.6,
    type: "movie",
    category: "kids",
    posterUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop"
  },
  {
    id: "encanto",
    title: "Encanto",
    description: "A Colombian teenage girl has to face the frustration of being the only member of her family without magical powers.",
    genre: ["Animation", "Comedy", "Family"],
    year: 2021,
    rating: 7.2,
    type: "movie",
    category: "kids",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop"
  }
];
function getContentByCategory(category) {
  if (category === "movies") {
    return moviesData.filter((content2) => content2.type === "movie");
  }
  if (category === "series") {
    return moviesData.filter((content2) => content2.type === "series");
  }
  if (category === "kids") {
    return moviesData.filter((content2) => content2.category === "kids");
  }
  return moviesData;
}
const container$1 = "_container_1xqbb_1";
const main$1 = "_main_1xqbb_6";
const header = "_header_1xqbb_12";
const title$1 = "_title_1xqbb_16";
const subtitle = "_subtitle_1xqbb_23";
const grid = "_grid_1xqbb_29";
const empty = "_empty_1xqbb_35";
const styles$1 = {
  container: container$1,
  main: main$1,
  header,
  title: title$1,
  subtitle,
  grid,
  empty
};
function meta$1({
  params
}) {
  const categoryName = params.name || "content";
  return [{
    title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} - TG Mov`
  }, {
    name: "description",
    content: `Browse ${categoryName} on TG Mov`
  }];
}
const category_$name = UNSAFE_withComponentProps(function CategoryPage() {
  const navigate = useNavigate();
  const params = useParams();
  const categoryName = params.name || "all";
  const content2 = getContentByCategory(categoryName);
  const handleSearch = (query2) => {
    navigate(`/search?q=${encodeURIComponent(query2)}`);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: styles$1.container,
    children: [/* @__PURE__ */ jsx(Header, {
      onSearch: handleSearch
    }), /* @__PURE__ */ jsxs("main", {
      className: styles$1.main,
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles$1.header,
        children: [/* @__PURE__ */ jsx("h1", {
          className: styles$1.title,
          children: categoryName
        }), /* @__PURE__ */ jsxs("p", {
          className: styles$1.subtitle,
          children: [content2.length, " titles available"]
        })]
      }), content2.length > 0 ? /* @__PURE__ */ jsx("div", {
        className: styles$1.grid,
        children: content2.map((item) => /* @__PURE__ */ jsx(ContentCard, {
          content: item
        }, item.id))
      }) : /* @__PURE__ */ jsx("div", {
        className: styles$1.empty,
        children: "No content found in this category"
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: category_$name,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const container = "_container_inbza_1";
const hero = "_hero_inbza_6";
const backdrop = "_backdrop_inbza_13";
const overlay = "_overlay_inbza_21";
const main = "_main_inbza_27";
const content = "_content_inbza_35";
const poster = "_poster_inbza_42";
const posterImage = "_posterImage_inbza_50";
const details = "_details_inbza_56";
const title = "_title_inbza_62";
const metadata = "_metadata_inbza_69";
const badge = "_badge_inbza_76";
const year = "_year_inbza_86";
const rating = "_rating_inbza_91";
const ratingIcon = "_ratingIcon_inbza_99";
const description = "_description_inbza_104";
const genres = "_genres_inbza_111";
const genre = "_genre_inbza_111";
const actions = "_actions_inbza_126";
const watchButton = "_watchButton_inbza_132";
const buttonIcon = "_buttonIcon_inbza_172";
const icon = "_icon_inbza_177";
const runtime = "_runtime_inbza_182";
const info = "_info_inbza_190";
const playerContainer = "_playerContainer_inbza_201";
const playerHeader = "_playerHeader_inbza_207";
const playerInfo = "_playerInfo_inbza_215";
const backToDetails = "_backToDetails_inbza_219";
const playerTitle = "_playerTitle_inbza_237";
const controls = "_controls_inbza_243";
const controlGroup = "_controlGroup_inbza_255";
const label = "_label_inbza_261";
const serverButtons = "_serverButtons_inbza_266";
const serverButton = "_serverButton_inbza_266";
const active = "_active_inbza_288";
const episodeControls = "_episodeControls_inbza_294";
const selectWrapper = "_selectWrapper_inbza_302";
const select = "_select_inbza_302";
const selectIcon = "_selectIcon_inbza_323";
const episodeGrid = "_episodeGrid_inbza_334";
const episodeButton = "_episodeButton_inbza_342";
const loading = "_loading_inbza_365";
const noEpisodes = "_noEpisodes_inbza_372";
const playerWrapper = "_playerWrapper_inbza_379";
const player = "_player_inbza_201";
const notFound = "_notFound_inbza_400";
const backButton = "_backButton_inbza_415";
const styles = {
  container,
  hero,
  backdrop,
  overlay,
  main,
  content,
  poster,
  posterImage,
  details,
  title,
  metadata,
  badge,
  year,
  rating,
  ratingIcon,
  description,
  genres,
  genre,
  actions,
  watchButton,
  buttonIcon,
  icon,
  runtime,
  info,
  playerContainer,
  playerHeader,
  playerInfo,
  backToDetails,
  playerTitle,
  controls,
  controlGroup,
  label,
  serverButtons,
  serverButton,
  active,
  episodeControls,
  selectWrapper,
  select,
  selectIcon,
  episodeGrid,
  episodeButton,
  loading,
  noEpisodes,
  playerWrapper,
  player,
  notFound,
  backButton
};
function meta({
  params
}) {
  return [{
    title: `Movie Details - Movie Hub`
  }, {
    name: "description",
    content: "Watch movies and series online"
  }];
}
async function loader({
  params
}) {
  const movieDetails = await getMovieDetails(params.id || "");
  let episodes = [];
  if (movieDetails && movieDetails.Type === "series" && movieDetails.totalSeasons) {
    episodes = await getSeasonDetails(params.id || "", 1);
  }
  return {
    movie: movieDetails,
    initialEpisodes: episodes
  };
}
const STREAMING_SERVERS = [{
  id: "2embed",
  name: "2Embed",
  url: (id, s, e) => s && e ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}`
}, {
  id: "vidsrc",
  name: "VidSrc",
  url: (id, s, e) => s && e ? `https://vidsrc.xyz/embed/tv?imdb=${id}&season=${s}&episode=${e}` : `https://vidsrc.xyz/embed/movie?imdb=${id}`
}, {
  id: "smashystream",
  name: "SmashyStream",
  url: (id, s, e) => s && e ? `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` : `https://player.smashy.stream/movie/${id}`
}];
const content_$type_$id = UNSAFE_withComponentProps(function ContentDetailsPage({
  loaderData,
  params
}) {
  const navigate = useNavigate();
  const {
    movie,
    initialEpisodes
  } = loaderData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedServer, setSelectedServer] = useState(STREAMING_SERVERS[0]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const handleSearch = (query2) => {
    navigate(`/search?q=${encodeURIComponent(query2)}`);
  };
  useEffect(() => {
    if (movie?.Type === "series" && selectedSeason) {
      setIsLoadingEpisodes(true);
      getSeasonDetails(params.id || "", selectedSeason).then((eps) => {
        setEpisodes(eps);
        setSelectedEpisode(1);
      }).finally(() => setIsLoadingEpisodes(false));
    }
  }, [selectedSeason, movie?.Type, params.id]);
  const handleWatchNow = () => {
    setIsPlaying(true);
  };
  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
  };
  const handleEpisodeChange = (episode) => {
    setSelectedEpisode(episode);
  };
  const handleServerChange = (server) => {
    setSelectedServer(server);
  };
  const getPlayerUrl = () => {
    if (movie?.Type === "series") {
      return selectedServer.url(movie.imdbID, selectedSeason, selectedEpisode);
    }
    return selectedServer.url(movie?.imdbID || "");
  };
  const handleStopPlaying = () => {
    setIsPlaying(false);
  };
  if (!movie) {
    return /* @__PURE__ */ jsxs("div", {
      className: styles.container,
      children: [/* @__PURE__ */ jsx(Header, {
        onSearch: handleSearch
      }), /* @__PURE__ */ jsxs("div", {
        className: styles.notFound,
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Movie not found"
        }), /* @__PURE__ */ jsxs("button", {
          onClick: () => navigate("/"),
          className: styles.backButton,
          children: [/* @__PURE__ */ jsx(ArrowLeft, {}), " Go Back Home"]
        })]
      })]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: styles.container,
    children: [/* @__PURE__ */ jsx(Header, {
      onSearch: handleSearch
    }), isPlaying ? /* @__PURE__ */ jsxs("div", {
      className: styles.playerContainer,
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles.playerHeader,
        children: [/* @__PURE__ */ jsxs("button", {
          onClick: handleStopPlaying,
          className: styles.backToDetails,
          children: [/* @__PURE__ */ jsx(ArrowLeft, {
            className: styles.icon
          }), "Back to Details"]
        }), /* @__PURE__ */ jsx("div", {
          className: styles.playerInfo,
          children: /* @__PURE__ */ jsxs("h2", {
            className: styles.playerTitle,
            children: [movie.Title, movie.Type === "series" && ` - S${selectedSeason} E${selectedEpisode}`]
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: styles.controls,
        children: [/* @__PURE__ */ jsxs("div", {
          className: styles.controlGroup,
          children: [/* @__PURE__ */ jsx("label", {
            className: styles.label,
            children: "Server:"
          }), /* @__PURE__ */ jsx("div", {
            className: styles.serverButtons,
            children: STREAMING_SERVERS.map((server) => /* @__PURE__ */ jsx("button", {
              className: `${styles.serverButton} ${selectedServer.id === server.id ? styles.active : ""}`,
              onClick: () => handleServerChange(server),
              children: server.name
            }, server.id))
          })]
        }), movie.Type === "series" && movie.totalSeasons && /* @__PURE__ */ jsxs("div", {
          className: styles.episodeControls,
          children: [/* @__PURE__ */ jsxs("div", {
            className: styles.controlGroup,
            children: [/* @__PURE__ */ jsx("label", {
              className: styles.label,
              children: "Season:"
            }), /* @__PURE__ */ jsxs("div", {
              className: styles.selectWrapper,
              children: [/* @__PURE__ */ jsx("select", {
                value: selectedSeason,
                onChange: (e) => handleSeasonChange(Number(e.target.value)),
                className: styles.select,
                children: Array.from({
                  length: parseInt(movie.totalSeasons)
                }, (_, i) => i + 1).map((season) => /* @__PURE__ */ jsxs("option", {
                  value: season,
                  children: ["Season ", season]
                }, season))
              }), /* @__PURE__ */ jsx(ChevronDown, {
                className: styles.selectIcon
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles.controlGroup,
            children: [/* @__PURE__ */ jsx("label", {
              className: styles.label,
              children: "Episode:"
            }), /* @__PURE__ */ jsx("div", {
              className: styles.episodeGrid,
              children: isLoadingEpisodes ? /* @__PURE__ */ jsx("div", {
                className: styles.loading,
                children: "Loading episodes..."
              }) : episodes.length > 0 ? episodes.map((ep) => /* @__PURE__ */ jsx("button", {
                className: `${styles.episodeButton} ${selectedEpisode === parseInt(ep.Episode) ? styles.active : ""}`,
                onClick: () => handleEpisodeChange(parseInt(ep.Episode)),
                title: ep.Title,
                children: ep.Episode
              }, ep.Episode)) : /* @__PURE__ */ jsx("div", {
                className: styles.noEpisodes,
                children: "No episodes available"
              })
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: styles.playerWrapper,
        children: /* @__PURE__ */ jsx("iframe", {
          src: getPlayerUrl(),
          className: styles.player,
          frameBorder: "0",
          allowFullScreen: true,
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          title: movie.Title
        }, getPlayerUrl())
      })]
    }) : /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles.hero,
        children: [/* @__PURE__ */ jsx("img", {
          src: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/1920x1080/333/999?text=No+Image",
          alt: "",
          className: styles.backdrop
        }), /* @__PURE__ */ jsx("div", {
          className: styles.overlay
        })]
      }), /* @__PURE__ */ jsx("main", {
        className: styles.main,
        children: /* @__PURE__ */ jsxs("div", {
          className: styles.content,
          children: [/* @__PURE__ */ jsx("div", {
            className: styles.poster,
            children: /* @__PURE__ */ jsx("img", {
              src: movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/400x600/333/999?text=No+Poster",
              alt: movie.Title,
              className: styles.posterImage
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: styles.details,
            children: [/* @__PURE__ */ jsx("h1", {
              className: styles.title,
              children: movie.Title
            }), /* @__PURE__ */ jsxs("div", {
              className: styles.metadata,
              children: [/* @__PURE__ */ jsx("span", {
                className: styles.badge,
                children: movie.Type === "movie" ? "Movie" : "Series"
              }), movie.Released && /* @__PURE__ */ jsxs("span", {
                className: styles.year,
                children: [/* @__PURE__ */ jsx(Calendar, {
                  className: styles.icon
                }), movie.Released]
              }), movie.Runtime && /* @__PURE__ */ jsxs("span", {
                className: styles.runtime,
                children: [/* @__PURE__ */ jsx(Clock, {
                  className: styles.icon
                }), movie.Runtime]
              }), movie.imdbRating && /* @__PURE__ */ jsxs("div", {
                className: styles.rating,
                children: [/* @__PURE__ */ jsx(Star, {
                  className: styles.ratingIcon
                }), "IMDB ", movie.imdbRating]
              })]
            }), movie.Plot && /* @__PURE__ */ jsx("p", {
              className: styles.description,
              children: movie.Plot
            }), movie.Genre && /* @__PURE__ */ jsx("div", {
              className: styles.genres,
              children: movie.Genre.split(", ").map((genre2) => /* @__PURE__ */ jsx("span", {
                className: styles.genre,
                children: genre2
              }, genre2))
            }), movie.Director && /* @__PURE__ */ jsxs("div", {
              className: styles.info,
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Director:"
              }), " ", movie.Director]
            }), movie.Actors && /* @__PURE__ */ jsxs("div", {
              className: styles.info,
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Cast:"
              }), " ", movie.Actors]
            }), /* @__PURE__ */ jsx("div", {
              className: styles.actions,
              children: /* @__PURE__ */ jsxs("button", {
                className: styles.watchButton,
                onClick: handleWatchNow,
                children: [/* @__PURE__ */ jsx(Play, {
                  className: styles.buttonIcon
                }), "Watch Now"]
              })
            })]
          })]
        })
      })]
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: content_$type_$id,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D0MbaGPf.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/index-Be18r5b1.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-BdlRzFWX.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/index-Be18r5b1.js", "/assets/index-BG4RV-HE.js"], "css": ["/assets/root-DxH-L6A1.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-B8KwPwmU.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/header-D-CwGV9i.js", "/assets/index-BG4RV-HE.js", "/assets/content-card-D_4qvpKt.js"], "css": ["/assets/home-BZHmkove.css", "/assets/header-DBt1abCF.css", "/assets/content-card-T3vFgTjn.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/search": { "id": "routes/search", "parentId": "root", "path": "search", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/search-BdJmyXj5.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/header-D-CwGV9i.js", "/assets/content-card-D_4qvpKt.js", "/assets/index-BG4RV-HE.js"], "css": ["/assets/search-olFxZwlh.css", "/assets/header-DBt1abCF.css", "/assets/content-card-T3vFgTjn.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/category.$name": { "id": "routes/category.$name", "parentId": "root", "path": ":name", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/category._name-C6amO5n9.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/header-D-CwGV9i.js", "/assets/content-card-D_4qvpKt.js", "/assets/index-BG4RV-HE.js"], "css": ["/assets/category-CfCCPpbb.css", "/assets/header-DBt1abCF.css", "/assets/content-card-T3vFgTjn.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/content.$type.$id": { "id": "routes/content.$type.$id", "parentId": "root", "path": ":type/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/content._type._id-CAqCTmnc.js", "imports": ["/assets/chunk-JMJ3UQ3L-DY0ygI11.js", "/assets/header-D-CwGV9i.js", "/assets/index-BG4RV-HE.js"], "css": ["/assets/content._type-UqKclk9Y.css", "/assets/header-DBt1abCF.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-fe9808c5.js", "version": "fe9808c5", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": true, "unstable_subResourceIntegrity": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/search": {
    id: "routes/search",
    parentId: "root",
    path: "search",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/category.$name": {
    id: "routes/category.$name",
    parentId: "root",
    path: ":name",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/content.$type.$id": {
    id: "routes/content.$type.$id",
    parentId: "root",
    path: ":type/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
