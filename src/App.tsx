import React, { useState,useEffect } from "react";
import { Tree, TreeNode } from "./components/Tree";
import { v4 as uuidv4 } from "uuid";
//iptalimport "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css"

const LOCAL_STORAGE_KEY = "tree_data";

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [editMode,setEditMode] = useState(false);
  const[editNodeId,setEdtNodeId] = useState<string | null>(null);
  const [search,setSearch] = useState("");

  //localstorage kayit
  const saveLocalStorage = (data:TreeNode[]) =>{
    localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(data));
  };

  //localstorage loaddata
  const loadLocalStorage = (): TreeNode[] =>{
    const data =localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  //ilk acilista verileri yukleme

  useEffect(()=>{
    const loaded = loadLocalStorage();
    setTreeData(loaded);
  },[]);

  const handleAddNew = () =>{
    if(!newTitle.trim() && !newContent.trim()) return;

    const newNode: TreeNode = {
      id:uuidv4(),
      title:newTitle || "Basliksiz",
      content:newContent,
      children:[],
    };

    let updatedTree: TreeNode[];

    if(selectedNode){
      //alt baslik olarak ekleme
      updatedTree = addChildToTree(treeData,selectedNode.id,newNode);

    }else{
      //ana baslik olarak ekle
      updatedTree = [...treeData,newNode];

    }

    setTreeData(updatedTree);
    saveLocalStorage(updatedTree);
    setNewTitle('');
    setNewContent('');
  }

  const handleDelete = (idTodDelete:string) =>{
    const updated = deleteNodeFromTree(treeData,idTodDelete);
    setTreeData(updated);
    saveLocalStorage(updated);
    if(selectedNode?.id === idTodDelete){
      setSelectedNode(null);
    }
  };

  const handleEdit = (node:TreeNode) =>{
    setEditMode(true);
    setEdtNodeId(node.id);
    setNewTitle(node.title);
    setNewContent(node.content || "");
  };

  const handleUpdateNode = ()=>{
    if(!editNodeId) return;

    const updatedTree = updateNodeTree(treeData,editNodeId,newTitle,newContent);
    setTreeData(updatedTree);
    saveLocalStorage(updatedTree);
    setEditMode(false);
    setEdtNodeId(null);
    setNewTitle("");
    setNewContent("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setSearch(e.target.value);
  };

  const filtretedTreeData= filterTree(treeData,search.toLowerCase());
  

  return (
    <div className="container py-4">
      <div className="row">
        {/* Sol Kısım: Ağaç */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <span>Dokuman</span> 
              <input
                type="text"
                className="form-control form-control-sm w-50"
                placeholder="Başlık ara..."
                value={search}
                onChange={handleSearch}
                />
            </div>
            <div className="card-body">
              {treeData.length === 0 ? (
                <p>Henüz başlık eklenmedi.</p>
              ) : (
                <Tree
                  data={filtretedTreeData}
                  onSelect={(node) => setSelectedNode(node)}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  selectedId={selectedNode?.id || null}
                />
              )}
            </div>
          </div>
        </div>

        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              {editMode ? "Başlığı Güncelle" : selectedNode ? "Alt Başlık Ekle" : "Yeni Başlık Ekle"}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Başlık</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Başlık giriniz..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">İçerik</label>
                <textarea
                  className="form-control"
                  placeholder="İçerik giriniz..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                />
              </div>

              {editMode ? (
                <button
                  onClick={handleUpdateNode}
                  className="btn btn-success w-100"
                >
                  Güncelle
                </button>
              ) : (
                <button
                  onClick={handleAddNew}
                  className="btn btn-primary w-100"
                >
                  {selectedNode ? "Alt Başlık Ekle" : "Başlık Ekle"}
                </button>
              )}

              {selectedNode && !editMode && (
                <p className="mt-3 text-muted small">
                  Seçilen başlık: <strong>{selectedNode.title}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


function addChildToTree(
  nodes: TreeNode[],
  parentId: string,
  child: TreeNode
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), child],
      };
    }

    if (node.children) {
      return {
        ...node,
        children: addChildToTree(node.children, parentId, child),
      };
    }

    return node;
  });
}

function deleteNodeFromTree(nodes:TreeNode[],idTodDelete:string):TreeNode[]{
  return nodes
    .filter((node)=>node.id!==idTodDelete)
    .map((node)=>({
      ...node,
      children:node.children ? deleteNodeFromTree(node.children,idTodDelete) : [],
    }));
}

function updateNodeTree(
  nodes:TreeNode[],
  targetId:string,
  newTite:string,
  newContent:string
): TreeNode[] {
  return nodes.map((node)=>{
    if(node.id === targetId){
      return{
        ...node,
        title:newTite,
        content:newContent,
      };
    }
    if(node.children){
      return{
        ...node,
        children: updateNodeTree(node.children,targetId,newTite,newContent),
      };
    }
    return node;
  });
}

function filterTree(nodes:TreeNode[],term:string): TreeNode[] {
  return nodes
    .map((node)=>{
      const titleMatch = node.title.toLowerCase().includes(term);
      const contentMatch = node.title.toLowerCase().includes(term);
      const matchedChildren = node.children
        ? filterTree(node.children,term)
          :[];

          if(titleMatch || contentMatch || matchedChildren.length > 0){
            const filteredNode: TreeNode = {
              id:node.id,
              title:node.title,
              content:node.content,
            };

            if(matchedChildren.length>0){
              filteredNode.children= matchedChildren;
            }
            return filteredNode;
          }
          return null;
    })
    .filter((m): m is TreeNode => m !==null);
}

export default App;
