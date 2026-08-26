import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const COLUMNS = [
  { key: "proposed", label: "Proposed" },
  { key: "planned", label: "Planned" },
  { key: "confirmed", label: "Confirmed" },
];

/** SocialPlanBoard — §4.4 drag a plan between stages; dropping it updates
 *  its status directly, no separate confirm/edit buttons needed. */
export default function SocialPlanBoard({ plans = [], contacts = [], reload }) {
  const contactName = (id) => contacts.find((c) => c.id === id)?.name || "—";
  const byCol = (key) => plans.filter((p) => p.status === key);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const patch = { status: destination.droppableId };
    if (destination.droppableId === "confirmed") patch.confirmed_at = new Date().toISOString();
    await base44.entities.SocialPlan.update(draggableId, patch);
    await reload();
  };

  const cancel = async (id) => { await base44.entities.SocialPlan.update(id, { status: "cancelled" }); await reload(); };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COLUMNS.map((col) => (
          <Droppable droppableId={col.key} key={col.key}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className={`rounded-2xl p-3 min-h-[160px] transition-colors ${snapshot.isDraggingOver ? "bg-olive/10" : "bg-muted/30"}`}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-1">{col.label} · {byCol(col.key).length}</p>
                <div className="space-y-2">
                  {byCol(col.key).map((p, i) => (
                    <Draggable draggableId={p.id} index={i} key={p.id}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                          className={`rounded-xl bg-card p-3 shadow-sm cursor-grab group relative ${snap.isDragging ? "ring-2 ring-olive" : ""}`}>
                          <button onClick={() => cancel(p.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground"><X className="h-3 w-3" /></button>
                          <p className="text-sm font-medium truncate pr-4">{p.activity}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{(p.contact_ids || []).map(contactName).join(", ") || "—"}</p>
                          {p.suggested_date && <p className="text-[10px] text-muted-foreground mt-1">{new Date(p.suggested_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}