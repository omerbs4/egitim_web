export interface TreeNode{
    id:string;
    title:string;
    content?: string;
    children?: TreeNode[];
}