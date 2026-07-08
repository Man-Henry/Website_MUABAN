import"./rolldown-runtime-Cyuzqnbw.js";import{ht as e}from"./deps-C9fbaaQ4.js";import{l as t}from"./vendor-DYWQdvk9.js";import{n}from"./ui-6n5Pz2ge.js";import{a as r,d as i,g as a,i as o,u as s}from"./index-RSu2ZPoc.js";e();var c=n(),l=({listingId:e,variant:n=`icon`,className:l=``})=>{let u=s(),d=t(),{showToast:f}=r(),{isAuthenticated:p}=o(),m=i(t=>t.bookmark.bookmarkedIds.includes(e)),h=t=>{if(t.preventDefault(),t.stopPropagation(),!p){f({type:`info`,message:`Vui lòng đăng nhập để lưu tin.`}),d(`/dang-nhap`);return}u(a(e)),f({type:m?`info`:`success`,message:m?`Đã bỏ lưu tin.`:`Đã lưu tin thành công!`,duration:2e3})};return n===`button`?(0,c.jsxs)(`button`,{type:`button`,onClick:h,className:`
          inline-flex items-center gap-2 rounded-xl border px-4 py-2.5
          text-body-sm font-medium transition-all duration-200 cursor-pointer
          ${m?`border-primary bg-primary-container/10 text-primary`:`border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface`}
          ${l}
        `,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[18px] ${m?`material-symbols-filled`:``}`,children:`bookmark`}),m?`Đã lưu`:`Lưu tin`]}):(0,c.jsx)(`button`,{type:`button`,onClick:h,className:`
        flex h-9 w-9 items-center justify-center rounded-full
        transition-all duration-200 cursor-pointer
        ${m?`bg-primary-container/20 text-primary`:`bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant hover:text-primary hover:bg-primary-container/10`}
        ${l}
      `,"aria-label":m?`Bỏ lưu`:`Lưu tin`,children:(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[20px] ${m?`material-symbols-filled`:``}`,children:`bookmark`})})};export{l as t};