import{d as A,r as d,s as F,I as H,y as S,j as o,u as X,P as q,b as N,N as Q,L as Y,k as G,B as J}from"./index-BPeECl7p.js";import{D as W,C}from"./column.esm-BubpOjHn.js";import{u as $,b as B,C as L,j as V,B as E}from"./button.esm-FmnCOphG.js";import{u as Z}from"./useQuery-0tb3Fb_H.js";import{r as z}from"./roles.api-CBmaAIbs.js";import{L as ee}from"./lock-DUGrWI4C.js";import{P as te}from"./plus-CyIt6JBb.js";import{S as re}from"./square-pen-CP88_t48.js";import"./index.esm-npHvDFiR.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]],ne=A("wrench",se);function j(e){"@babel/helpers - typeof";return j=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},j(e)}function oe(e,t){if(j(e)!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(j(n)!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function ae(e){var t=oe(e,"string");return j(t)=="symbol"?t:t+""}function k(e,t,r){return(t=ae(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var le={value:"p-tag-value",icon:"p-tag-icon",root:function(t){var r=t.props;return S("p-tag p-component",k(k({},"p-tag-".concat(r.severity),r.severity!==null),"p-tag-rounded",r.rounded))}},ie=`
@layer primereact {
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .p-tag-icon,
    .p-tag-value,
    .p-tag-icon.pi {
        line-height: 1.5;
    }
    
    .p-tag.p-tag-rounded {
        border-radius: 10rem;
    }
}
`,O=L.extend({defaultProps:{__TYPE:"Tag",value:null,severity:null,rounded:!1,icon:null,style:null,className:null,children:void 0},css:{classes:le,styles:ie}});function D(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(s){return Object.getOwnPropertyDescriptor(e,s).enumerable})),r.push.apply(r,n)}return r}function ce(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?D(Object(r),!0).forEach(function(n){k(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):D(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}var M=d.forwardRef(function(e,t){var r=$(),n=d.useContext(F),s=O.getProps(e,n),l=O.setMetaData({props:s}),u=l.ptm,p=l.cx,m=l.isUnstyled;B(O.css.styles,m,{name:"tag"});var i=d.useRef(null),f=r({className:p("icon")},u("icon")),y=H.getJSXIcon(s.icon,ce({},f),{props:s});d.useImperativeHandle(t,function(){return{props:s,getElement:function(){return i.current}}});var b=r({ref:i,className:S(s.className,p("root")),style:s.style},O.getOtherProps(s),u("root")),g=r({className:p("value")},u("value"));return d.createElement("span",b,y,d.createElement("span",g,s.value),d.createElement("span",null,s.children))});M.displayName="Tag";function x(e){"@babel/helpers - typeof";return x=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},x(e)}function ue(e,t){if(x(e)!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(x(n)!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function de(e){var t=ue(e,"string");return x(t)=="symbol"?t:t+""}function pe(e,t,r){return(t=de(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var me={root:function(t){var r=t.props;return S("p-skeleton p-component",{"p-skeleton-circle":r.shape==="circle","p-skeleton-none":r.animation==="none"})}},fe=`
@layer primereact {
    .p-skeleton {
        position: relative;
        overflow: hidden;
    }
    
    .p-skeleton::after {
        content: "";
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
    }
    
    .p-skeleton-circle {
        border-radius: 50%;
    }
    
    .p-skeleton-none::after {
        animation: none;
    }
}

@keyframes p-skeleton-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}
`,be={root:{position:"relative"}},P=L.extend({defaultProps:{__TYPE:"Skeleton",shape:"rectangle",size:null,width:"100%",height:"1rem",borderRadius:null,animation:"wave",style:null,className:null},css:{classes:me,inlineStyles:be,styles:fe}});function _(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(s){return Object.getOwnPropertyDescriptor(e,s).enumerable})),r.push.apply(r,n)}return r}function T(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?_(Object(r),!0).forEach(function(n){pe(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):_(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}var U=d.memo(d.forwardRef(function(e,t){var r=$(),n=d.useContext(F),s=P.getProps(e,n),l=P.setMetaData({props:s}),u=l.ptm,p=l.cx,m=l.sx,i=l.isUnstyled;B(P.css.styles,i,{name:"skeleton"});var f=d.useRef(null);d.useImperativeHandle(t,function(){return{props:s,getElement:function(){return f.current}}});var y=s.size?{width:s.size,height:s.size,borderRadius:s.borderRadius}:{width:s.width,height:s.height,borderRadius:s.borderRadius},b=r({ref:f,className:S(s.className,p("root")),style:T(T({},y),m("root")),"aria-hidden":!0},P.getOtherProps(s),u("root"));return d.createElement("div",b)}));U.displayName="Skeleton";const ye=({title:e,data:t,totalRecords:r,columns:n,lazyParams:s,onLazyLoad:l,loading:u=!1,onCreate:p,onExport:m,onRowClick:i,actions:f})=>{const y=a=>{l({...s,first:a.first,rows:a.rows,page:a.page||0})},b=a=>{l({...s,sortField:a.sortField,sortOrder:a.sortOrder})},g=a=>{l({...s,globalFilter:a.target.value,first:0,page:0})},c=()=>o.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 border-b border-theme-border rounded-t-[0.75rem]",children:[o.jsx("h2",{className:"text-xl font-semibold text-theme-primary mb-4 md:mb-0",children:e}),o.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 w-full md:w-auto",children:[o.jsxs("span",{className:"p-input-icon-left w-full sm:w-auto",children:[o.jsx("i",{className:"pi pi-search"}),o.jsx(V,{value:s.globalFilter||"",onChange:g,placeholder:"Global Search...",className:"w-full sm:w-64 rounded-[0.75rem] form-control-theme"})]}),m&&o.jsx(E,{label:"Export",icon:"pi pi-download",outlined:!0,onClick:m,className:"rounded-[0.75rem] btn-outline-theme border-brand-teal-600 text-brand-teal-600 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20"}),p&&o.jsx(E,{label:"Create New",icon:"pi pi-plus",onClick:p,className:"rounded-[0.75rem] bg-brand-teal-600 border-brand-teal-600 hover:bg-brand-teal-700 text-white"})]})]}),h=a=>{var R;const w=typeof a.status=="string"?a.status:((R=a.status)==null?void 0:R.name)||"",K=w.toLowerCase();let v=null;switch(K){case"active":case"completed":case"approved":v="success";break;case"pending":case"in progress":case"review":v="warning";break;case"closed":case"rejected":case"inactive":v="danger";break;default:v="info"}return o.jsx(M,{value:w,severity:v,className:"rounded-[0.75rem] px-3 py-1"})},I=()=>o.jsx(U,{className:"mb-2 rounded-[0.75rem]",height:"2rem"});return o.jsx("div",{className:"card card-base rounded-[0.75rem] overflow-hidden",children:o.jsxs(W,{value:u?Array.from({length:s.rows}):t,lazy:!0,dataKey:"id",paginator:!0,first:s.first,rows:s.rows,totalRecords:r,onPage:y,onSort:b,sortField:s.sortField,sortOrder:s.sortOrder,rowsPerPageOptions:[5,10,25,50],header:c(),emptyMessage:"No records found.",className:"w-full text-sm text-theme-primary",rowClassName:a=>`table-body-row ${i&&!u?"cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50":""}`,onRowClick:a=>{i&&!u&&i(a.data)},children:[n.map((a,w)=>o.jsx(C,{field:a.field,header:a.header,sortable:a.sortable!==!1,body:u?I:a.field.toLowerCase()==="status"&&!a.body?h:a.body,className:"p-4 table-body-cell",headerClassName:"table-header-cell p-4 border-b border-theme-border bg-theme-secondary text-theme-muted font-bold tracking-wider uppercase text-xs"},w)),f&&!u&&o.jsx(C,{body:f,className:"p-4 table-body-cell w-24"})]})})};function ge(e){return Z({queryKey:["roles",e],queryFn:async()=>{let r=[...await z.getRoles()];e.globalFilter&&(r=r.filter(l=>l.name.toLowerCase().includes(e.globalFilter.toLowerCase()))),e.sortField&&r.sort((l,u)=>{const p=l[e.sortField],m=u[e.sortField],i=p<m?-1:p>m?1:0;return e.sortOrder===-1?-i:i});const n=r.length;return{data:r.slice(e.first,e.first+e.rows),totalRecords:n,page:e.page}},placeholderData:t=>t})}const he=e=>({canEdit:!0,canDelete:!1}),Re=()=>{const e=X(),{canDelete:t}=he(),[r,n]=d.useState({first:0,rows:10,page:0,sortField:void 0,sortOrder:void 0,globalFilter:null}),{data:s,isLoading:l,isError:u}=ge(r),p=[{field:"id",header:"Role ID",sortable:!0},{field:"name",header:"Role Name",sortable:!0},{field:"description",header:"Description"},{field:"users_count",header:"Users",sortable:!0,body:c=>o.jsx("span",{children:c.users_count||0})},{field:"permissions",header:"Permissions",body:c=>o.jsxs("span",{children:[c.permissions?Object.keys(c.permissions).length:0," modules"]})}],m=c=>o.jsxs("div",{className:"flex gap-2 justify-end",children:[o.jsx("button",{onClick:h=>{h.stopPropagation(),e(`/roles/edit/${c.id}`)},className:"p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors",children:o.jsx(re,{className:"w-4 h-4"})}),t]}),i=(s==null?void 0:s.data)||[],f=(s==null?void 0:s.totalRecords)||0,y=i.reduce((c,h)=>c+(h.users_count||0),0),b=i.filter(c=>["Admin","Manager","Employee"].includes(c.name)).length,g=i.length-b;return o.jsx(q,{title:"Roles",actions:o.jsxs(J,{onClick:()=>e("/roles/create"),className:"bg-brand-teal-600",children:[o.jsx(te,{className:"w-4 h-4 mr-2"}),"Create Role"]}),children:o.jsxs("div",{className:"space-y-6",children:[o.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[o.jsx(N,{label:"Total Roles",value:f,icon:o.jsx(Q,{className:"w-5 h-5"})}),o.jsx(N,{label:"Active Users",value:y,icon:o.jsx(Y,{className:"w-5 h-5"})}),o.jsx(N,{label:"Custom Roles",value:g,icon:o.jsx(ne,{className:"w-5 h-5"})}),o.jsx(N,{label:"System Roles",value:b,icon:o.jsx(ee,{className:"w-5 h-5"})})]}),o.jsx(G,{children:o.jsx(ye,{title:"Roles Directory",columns:p,data:i,totalRecords:f,lazyParams:r,onLazyLoad:n,loading:l,onRowClick:c=>e(`/roles/${c.id}`),actions:m})})]})})};export{Re as Roles};
