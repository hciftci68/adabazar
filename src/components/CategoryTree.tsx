import React from "react";
import { ChevronRight, Home, Building, Building2, KeyRound, Car, Gauge, Laptop, Smartphone, Tag } from "lucide-react";
import { Category } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Dynamic Icon Renderer Helper
export const getCategoryIcon = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case "Home": return <Home className={className} />;
    case "Building": return <Building className={className} />;
    case "Building2": return <Building2 className={className} />;
    case "KeyRound": return <KeyRound className={className} />;
    case "Car": return <Car className={className} />;
    case "Gauge": return <Gauge className={className} />;
    case "Laptop": return <Laptop className={className} />;
    case "Smartphone": return <Smartphone className={className} />;
    default: return <Tag className={className} />;
  }
};

// Helper to determine if a descendant of a category is selected
const isDescendantSelected = (catId: string, categories: Category[], selectedId: string): boolean => {
  if (!selectedId) return false;
  const children = categories.filter(c => c.parentId === catId);
  for (const child of children) {
    if (child.id === selectedId) return true;
    if (isDescendantSelected(child.id, categories, selectedId)) return true;
  }
  return false;
};

interface CategoryTreeProps {
  parentId: string | null;
  depth?: number;
  categories: Category[];
  expandedCategories: Record<string, boolean>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedCatFilter: string;
  setSelectedCatFilter: (val: string) => void;
  getListingCountForCategory: (catId: string) => number;
  lang: "tr" | "en";
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  parentId,
  depth = 0,
  categories,
  expandedCategories,
  setExpandedCategories,
  selectedCatFilter,
  setSelectedCatFilter,
  getListingCountForCategory,
  lang,
}) => {
  const currentCats = categories.filter((c) => c.parentId === parentId);

  // Auto-expand ancestors (only runs on the root component where parentId === null)
  React.useEffect(() => {
    if (parentId === null && selectedCatFilter) {
      const getAncestors = (catId: string): string[] => {
        const list: string[] = [];
        let curr = categories.find(c => c.id === catId);
        while (curr && curr.parentId) {
          list.push(curr.parentId);
          curr = categories.find(c => c.id === curr.parentId);
        }
        return list;
      };

      const ancestors = getAncestors(selectedCatFilter);
      if (ancestors.length > 0) {
        setExpandedCategories(prev => {
          const next = { ...prev };
          let changed = false;
          ancestors.forEach(id => {
            if (!next[id]) {
              next[id] = true;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    }
  }, [parentId, selectedCatFilter, categories, setExpandedCategories]);

  if (currentCats.length === 0) return null;

  // Check if a descendant in this sub-tree branch is currently active/selected
  const isActiveBranch = parentId ? (selectedCatFilter === parentId || isDescendantSelected(parentId, categories, selectedCatFilter)) : false;

  const handleRowClick = (catId: string, hasChildren: boolean) => {
    // If clicking already selected category, clear the selection. Otherwise set it.
    setSelectedCatFilter(selectedCatFilter === catId ? "" : catId);
    
    // Smoothly expand/collapse parent nodes on selection
    if (hasChildren) {
      setExpandedCategories((prev) => ({
        ...prev,
        [catId]: !prev[catId],
      }));
    }
  };

  return (
    <div
      className={`flex flex-col gap-1.5 ${
        depth > 0 
          ? `ml-4 pl-3.5 border-l mt-1.5 transition-colors duration-300 ${
              isActiveBranch 
                ? "border-amber-500/40" 
                : "border-neutral-800/50 hover:border-neutral-700/60"
            }` 
          : ""
      }`}
      id={`cat-tree-depth-${depth}`}
    >
      {currentCats.map((cat) => {
        const hasChildren = categories.some((c) => c.parentId === cat.id);
        const isExpanded = !!expandedCategories[cat.id];
        const isSelected = selectedCatFilter === cat.id;
        const count = getListingCountForCategory(cat.id);

        return (
          <div key={cat.id} className="flex flex-col" id={`cat-tree-node-${cat.id}`}>
            <div
              onClick={() => handleRowClick(cat.id, hasChildren)}
              className={`group/row px-3 py-2.5 rounded-xl text-xs font-medium transition-all border flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-500 font-semibold shadow-md shadow-amber-500/15"
                  : "bg-neutral-950 text-zinc-400 border-neutral-800/80 hover:text-white hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden w-full">
                {/* Chevron expander button or clean alignment bullet */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategories((prev) => ({
                        ...prev,
                        [cat.id]: !prev[cat.id],
                      }));
                    }}
                    className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                    title={isExpanded ? (lang === "tr" ? "Daralt" : "Collapse") : (lang === "tr" ? "Genişlet" : "Expand")}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? "rotate-90 text-amber-500" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <div className="w-5.5 shrink-0 flex items-center justify-center">
                    <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-black/50" : "bg-neutral-700 group-hover/row:bg-neutral-500"}`} />
                  </div>
                )}

                {/* Icon & Label */}
                <div className="flex items-center gap-2 truncate">
                  {getCategoryIcon(
                    cat.icon,
                    `w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-black" : "text-amber-500/80"}`
                  )}
                  <span className="truncate">{lang === "tr" ? cat.nameTr : cat.nameEn}</span>
                </div>
              </div>

              {/* Listing Count Badge */}
              <div className="flex items-center gap-2 pl-2">
                <span
                  className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-black/10 text-black"
                      : "bg-neutral-900 text-zinc-500 group-hover/row:bg-neutral-800 group-hover/row:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </div>
            </div>

            {/* Smooth Nested Transition for Child CategoryTree */}
            <AnimatePresence initial={false}>
              {hasChildren && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-1">
                    <CategoryTree
                      parentId={cat.id}
                      depth={depth + 1}
                      categories={categories}
                      expandedCategories={expandedCategories}
                      setExpandedCategories={setExpandedCategories}
                      selectedCatFilter={selectedCatFilter}
                      setSelectedCatFilter={setSelectedCatFilter}
                      getListingCountForCategory={getListingCountForCategory}
                      lang={lang}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
