import React,{useState} from "react";
//iptalimport "../styles.css";

import "bootstrap/dist/css/bootstrap.min.css";

export type TreeNode={
    id:string;
    title:string;
    content?:string;
    children?:TreeNode[];
};

type TreeProps = {
    data:TreeNode[];
    onSelect:(node:TreeNode | null) =>void;
    onDelete:(id:string) => void;
    onEdit:(node:TreeNode) => void;
    selectedId: string | null;
};

export const Tree: React.FC<TreeProps> = ({data,onSelect,onDelete,onEdit,selectedId}) =>{
    return (
    <ul className="list-group ms-3">
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          onSelect={onSelect}
          onDelete={onDelete}
          onEdit={onEdit}
          selectedId={selectedId}
          
        />
      ))}
    </ul>
  );
};

const TreeNodeItem: React.FC<{
    node:TreeNode;
    onSelect:(node:TreeNode | null) =>void;
    onDelete:(id:string) =>void;
    onEdit:(node:TreeNode) => void;
    selectedId: string | null; 
}> = ({node,onSelect,onDelete,onEdit,selectedId}) =>{
    const [expanded,setExpanded] = useState(false);
    const hasChildren = node.children && node.children.length >0;
    const isSelected =selectedId === node.id;

    return(
        <li className="list-group-item border-0 ps-0">
          <div
            onClick={()=>{
              setExpanded(!expanded);
              onSelect(isSelected ? null : node);
            }}
            className={`d-flex justify-content-between align-items-start py-2 px-3 rounded ${
              isSelected ? "bg-info bg-opacity-25" : "bg-light"
            }`}
            style={{cursor:"pointer"}}

          >
            <div className="flex-grow-1">
              <strong>{hasChildren && (expanded ? "▼ " : "▶ ")}</strong>
              {node.title}
              {node.content && (
                 <div className="small text-muted mt-1 ms-4">
                  ↳ {node.content}
                  </div>
              )}
            </div>

            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
                >
                  Düzenle
                </button>
                <button
                  onClick={(e)=>{
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="btn btn-outline-danger"
                  >
                    Sil
                </button>
            </div>       
          </div>

          {expanded && hasChildren && (
            <ul className="list-group ms-4 mt-2">
              {node.children!.map((child)=>(
                <TreeNodeItem
                  key={child.id}
                  node={child}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  selectedId={selectedId}
                  />
              ))}
            </ul>
          )}
        </li>
  );
};