import {
  cleanStyle,
  ensureGlobalStyle,
  luminaTheme,
  omitProps,
  px,
} from "./utils.js";

function ensureDataStyles() {
  ensureGlobalStyle(
    "lumina-data-styles",
    `
.lumina-table tbody tr {
  transition: background-color 150ms ease;
}
.lumina-table tbody tr:not(.lumina-table-empty):hover {
  background-color: ${luminaTheme.colors.surfaceMuted};
}
`,
  );
}

export function DataTable({
  columns = [],
  rows = [],
  rowKey = (row, index) => row.id ?? row.key ?? index,
  sortBy,
  sortDirection = "asc",
  onSortChange,
  emptyText = "No rows",
  dense = false,
  stickyHeader = false,
  style = {},
  tableStyle = {},
  headerStyle = {},
  rowStyle = {},
  cellStyle = {},
  footer = null,
  onRowClick,
  ...props
} = {}) {
  ensureDataStyles();
  const visibleRows = sortBy
    ? sortRows(rows, columns, sortBy, sortDirection)
    : [...rows];

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "columns",
        "rows",
        "rowKey",
        "sortBy",
        "sortDirection",
        "onSortChange",
        "emptyText",
        "dense",
        "stickyHeader",
        "tableStyle",
        "headerStyle",
        "rowStyle",
        "cellStyle",
        "footer",
        "onRowClick",
      ]),
      style: cleanStyle({
        width: "100%",
        overflow: "auto",
        border: `1px solid ${luminaTheme.colors.border}`,
        borderRadius: luminaTheme.radius.md,
        backgroundColor: luminaTheme.colors.surface,
        color: luminaTheme.colors.text,
        boxShadow: luminaTheme.shadow.xs,
        ...style,
      }),
    },
    children: [
      {
        tag: "table",
        props: {
          role: props.role || "table",
          className: "lumina-table",
          style: cleanStyle({
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px",
            ...tableStyle,
          }),
        },
        children: [
          tableHead({
            columns,
            sortBy,
            sortDirection,
            onSortChange,
            dense,
            stickyHeader,
            headerStyle,
          }),
          {
            tag: "tbody",
            props: {},
            children: visibleRows.length
              ? visibleRows.map((row, rowIndex) =>
                  tableRow({
                    row,
                    rowIndex,
                    rowKey,
                    columns,
                    dense,
                    rowStyle,
                    cellStyle,
                    onRowClick,
                  }),
                )
              : [emptyRow(columns, emptyText, dense)],
          },
          footer
            ? {
                tag: "tfoot",
                props: {},
                children: Array.isArray(footer) ? footer : [footer],
              }
            : null,
        ],
      },
    ],
    key: props.key,
  };
}

export function Pagination({
  page = 1,
  pageSize = 10,
  totalItems,
  totalPages = totalItems === undefined
    ? 1
    : Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize))),
  siblingCount = 1,
  onPageChange,
  labels = {},
  showEdges = true,
  style = {},
  buttonStyle = {},
  activeStyle = {},
  ...props
} = {}) {
  const pageCount = Math.max(1, Number(totalPages) || 1);
  const currentPage = clamp(Number(page) || 1, 1, pageCount);
  const pages = paginationRange(currentPage, pageCount, siblingCount, showEdges);

  return {
    tag: "nav",
    props: {
      ...props,
      "aria-label": props["aria-label"] || "Pagination",
      style: cleanStyle({
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "6px",
        color: luminaTheme.colors.text,
        ...style,
      }),
    },
    children: [
      paginationButton({
        label: labels.previous || "Previous",
        disabled: currentPage <= 1,
        onClick: () => onPageChange?.(currentPage - 1),
        style: buttonStyle,
        key: "previous",
      }),
      ...pages.map((item, index) =>
        item === "ellipsis"
          ? {
              tag: "span",
              props: {
                "aria-hidden": "true",
                style: {
                  minWidth: "28px",
                  textAlign: "center",
                  color: luminaTheme.colors.muted,
                },
              },
              children: ["..."],
              key: `ellipsis-${index}`,
            }
          : paginationButton({
              label: String(item),
              active: item === currentPage,
              onClick: () => onPageChange?.(item),
              style: buttonStyle,
              activeStyle,
              key: item,
            }),
      ),
      paginationButton({
        label: labels.next || "Next",
        disabled: currentPage >= pageCount,
        onClick: () => onPageChange?.(currentPage + 1),
        style: buttonStyle,
        key: "next",
      }),
    ],
    key: props.key,
  };
}

export function sortRows(
  rows = [],
  columns = [],
  sortBy,
  sortDirection = "asc",
) {
  const column = columns.find((candidate) => candidate.key === sortBy);
  if (!column) return [...rows];

  const direction = sortDirection === "desc" ? -1 : 1;
  return [...rows].sort((left, right) => {
    const leftValue = sortValue(column, left);
    const rightValue = sortValue(column, right);

    if (leftValue === rightValue) return 0;
    if (leftValue === undefined || leftValue === null) return 1;
    if (rightValue === undefined || rightValue === null) return -1;

    return String(leftValue).localeCompare(String(rightValue), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * direction;
  });
}

export function paginationRange(
  page = 1,
  totalPages = 1,
  siblingCount = 1,
  showEdges = true,
) {
  const current = clamp(page, 1, totalPages);
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);
  const pages = [];

  if (showEdges) pages.push(1);
  if (leftSibling > 2) pages.push("ellipsis");

  for (
    let value = Math.max(leftSibling, showEdges ? 2 : 1);
    value <= Math.min(rightSibling, showEdges ? totalPages - 1 : totalPages);
    value += 1
  ) {
    pages.push(value);
  }

  if (rightSibling < totalPages - 1) pages.push("ellipsis");
  if (showEdges) pages.push(totalPages);

  return pages;
}

function tableHead({
  columns,
  sortBy,
  sortDirection,
  onSortChange,
  dense,
  stickyHeader,
  headerStyle,
}) {
  return {
    tag: "thead",
    props: {
      style: {
        position: stickyHeader ? "sticky" : undefined,
        top: stickyHeader ? 0 : undefined,
        zIndex: stickyHeader ? 1 : undefined,
      },
    },
    children: [
      {
        tag: "tr",
        props: {},
        children: columns.map((column) => {
          const sorted = sortBy === column.key;
          const nextDirection =
            sorted && sortDirection !== "desc" ? "desc" : "asc";
          const content = column.sortable
            ? {
                tag: "button",
                props: {
                  type: "button",
                  onClick: () => {
                    if (onSortChange) onSortChange(column.key, nextDirection);
                  },
                  style: cleanStyle({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: 0,
                    border: "none",
                    backgroundColor: "transparent",
                    color: "inherit",
                    font: "inherit",
                    fontWeight: 800,
                    cursor: "pointer",
                  }),
                },
                children: [
                  column.label ?? column.key,
                  sorted ? (sortDirection === "desc" ? "↓" : "↑") : "",
                ],
              }
            : column.label ?? column.key;

          return {
            tag: "th",
            props: {
              scope: "col",
              "aria-sort": sorted
                ? sortDirection === "desc"
                  ? "descending"
                  : "ascending"
                : undefined,
              style: cleanStyle({
                position: stickyHeader ? "sticky" : undefined,
                top: stickyHeader ? 0 : undefined,
                padding: dense ? "8px 12px" : "12px 14px",
                textAlign: column.align || "left",
                width: px(column.width),
                borderBottom: `1px solid ${luminaTheme.colors.border}`,
                backgroundColor: luminaTheme.colors.surfaceMuted,
                color: luminaTheme.colors.muted,
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                ...headerStyle,
                ...column.headerStyle,
              }),
            },
            children: [content],
            key: column.key,
          };
        }),
      },
    ],
  };
}

function tableRow({
  row,
  rowIndex,
  rowKey,
  columns,
  dense,
  rowStyle,
  cellStyle,
  onRowClick,
}) {
  const computedRowStyle =
    typeof rowStyle === "function" ? rowStyle(row, rowIndex) : rowStyle;

  return {
    tag: "tr",
    props: {
      onClick: onRowClick ? (event) => onRowClick(row, rowIndex, event) : undefined,
      style: cleanStyle({
        cursor: onRowClick ? "pointer" : undefined,
        ...computedRowStyle,
      }),
    },
    children: columns.map((column) => {
      const computedCellStyle =
        typeof cellStyle === "function"
          ? cellStyle(row, column, rowIndex)
          : cellStyle;

      return {
        tag: "td",
        props: {
          style: cleanStyle({
            padding: dense ? "8px 12px" : "12px 14px",
            textAlign: column.align || "left",
            borderBottom: `1px solid ${luminaTheme.colors.border}`,
            verticalAlign: "middle",
            ...computedCellStyle,
            ...column.cellStyle,
          }),
        },
        children: [cellContent(column, row, rowIndex)],
        key: column.key,
      };
    }),
    key: rowKey(row, rowIndex),
  };
}

function emptyRow(columns, emptyText, dense) {
  return {
    tag: "tr",
    props: {},
    children: [
      {
        tag: "td",
        props: {
          colSpan: Math.max(columns.length, 1),
          style: {
            padding: dense ? "16px 14px" : "28px 14px",
            textAlign: "center",
            color: luminaTheme.colors.muted,
          },
        },
        children: [emptyText],
      },
    ],
  };
}

function paginationButton({
  label,
  active = false,
  disabled = false,
  onClick,
  style = {},
  activeStyle = {},
  key,
}) {
  return {
    tag: "button",
    props: {
      type: "button",
      disabled,
      "aria-current": active ? "page" : undefined,
      onClick: (event) => {
        if (!disabled && onClick) onClick(event);
      },
      style: cleanStyle({
        minWidth: "36px",
        minHeight: "36px",
        padding: "7px 12px",
        borderRadius: luminaTheme.radius.md,
        border: `1px solid ${
          active ? luminaTheme.colors.primary : luminaTheme.colors.border
        }`,
        backgroundColor: active
          ? luminaTheme.colors.primary
          : "transparent",
        color: active ? "white" : luminaTheme.colors.text,
        font: "inherit",
        fontSize: "13px",
        fontWeight: active ? 700 : 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        ...style,
        ...(active ? activeStyle : {}),
      }),
    },
    children: [label],
    key,
  };
}

function cellContent(column, row, rowIndex) {
  if (column.render) return column.render(row, rowIndex);
  if (column.accessor) return column.accessor(row, rowIndex);
  return row[column.key] ?? "";
}

function sortValue(column, row) {
  if (column.sortValue) return column.sortValue(row);
  if (column.accessor) return column.accessor(row);
  return row[column.key];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
