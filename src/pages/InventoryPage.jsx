import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { matchesSearch } from "../utils/formatters";

export function InventorySection({ showHeading = true } = {}) {
  const {
    deleteInventoryItem,
    inventoryAlerts,
    inventoryItems,
    restockInventoryItem,
    searchQuery,
    session,
    updateInventoryItem,
  } = useHotelApp();
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category)))];
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState(inventoryItems[0]?.id ?? "");
  const [stockDraft, setStockDraft] = useState("");
  const [reorderDraft, setReorderDraft] = useState("");

  const filteredRows = useMemo(
    () =>
      inventoryItems.filter((item) => {
        const matchesCategory =
          categoryFilter === "all" ? true : item.category === categoryFilter;
        const matchesTerm = matchesSearch(
          `${item.name} ${item.category} ${item.vendor}`,
          searchQuery,
        );
        return matchesCategory && matchesTerm;
      }),
    [categoryFilter, inventoryItems, searchQuery],
  );
  const selectedItem =
    inventoryItems.find((item) => item.id === selectedItemId) ?? filteredRows[0] ?? null;

  useEffect(() => {
    if (selectedItem) {
      setStockDraft(String(selectedItem.stock));
      setReorderDraft(String(selectedItem.reorderLevel));
    }
  }, [selectedItem]);

  function selectInventoryItem(item) {
    setSelectedItemId(item.id);
    setStockDraft(String(item.stock));
    setReorderDraft(String(item.reorderLevel));
  }

  function saveInventoryItem() {
    if (!selectedItem) {
      return;
    }

    updateInventoryItem(selectedItem.id, {
      stock: Number(stockDraft || selectedItem.stock),
      reorderLevel: Number(reorderDraft || selectedItem.reorderLevel),
    });
  }

  function handleDeleteItem() {
    if (!selectedItem || !window.confirm("Delete this inventory item?")) {
      return;
    }

    deleteInventoryItem(selectedItem.id);
    setSelectedItemId("");
  }

  return (
    <>
      {showHeading && <SectionHeading title="Inventory" />}

      <div className="flex justify-end">
        <select
          className="input-base min-w-[220px]"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All categories" : category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_340px]">
        <Panel
          title="Stock list"
          action={<span className="text-sm text-slate-500">{filteredRows.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "name",
                header: "Item",
                truncate: true,
                minWidthClass: "min-w-[156px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "category",
                header: "Category",
                truncate: true,
                minWidthClass: "min-w-[124px]",
              },
              {
                key: "stock",
                header: "Stock",
                render: (row) => `${row.stock} ${row.unit}`,
                nowrap: true,
                minWidthClass: "min-w-[88px]",
              },
              {
                key: "reorderLevel",
                header: "Threshold",
                render: (row) => `${row.reorderLevel} ${row.unit}`,
                nowrap: true,
                minWidthClass: "min-w-[92px]",
              },
              { key: "vendor", header: "Supplier", truncate: true, minWidthClass: "min-w-[148px]" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusBadge value={row.stock <= row.reorderLevel ? "Low" : "Healthy"} />
                ),
                nowrap: true,
                minWidthClass: "min-w-[88px]",
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <button
                    className="btn-secondary h-8 px-2 text-xs"
                    type="button"
                    onClick={() => restockInventoryItem(row.id)}
                  >
                    Restock
                  </button>
                ),
                nowrap: true,
                minWidthClass: "min-w-[86px]",
              },
            ]}
            rows={filteredRows}
            onRowClick={selectInventoryItem}
            emptyTitle="No inventory items"
            emptyDescription="No stock items match the active filters."
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Low-stock alerts">
            <div className="divide-y divide-slate-200">
              {inventoryAlerts.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="truncate text-xs leading-5 text-slate-500">{item.vendor}</p>
                  </div>
                  <StatusBadge value="Low" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Reorder summary">
            <p className="text-[28px] font-semibold tracking-[-0.03em] text-slate-950">
              {inventoryAlerts.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">items below threshold</p>
          </Panel>

          {selectedItem && (
            <Panel title="Edit stock" description={selectedItem.name}>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="field-label">Stock</span>
                    <input
                      className="input-base"
                      type="number"
                      min="0"
                      value={stockDraft}
                      onChange={(event) => setStockDraft(event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="field-label">Reorder level</span>
                    <input
                      className="input-base"
                      type="number"
                      min="0"
                      value={reorderDraft}
                      onChange={(event) => setReorderDraft(event.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={saveInventoryItem}>
                    Save stock
                  </button>
                  {session.role === "management" && (
                    <button className="btn-danger" type="button" onClick={handleDeleteItem}>
                      Delete item
                    </button>
                  )}
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
