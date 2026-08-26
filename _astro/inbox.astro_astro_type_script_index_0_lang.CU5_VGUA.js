var e=document.getElementById(`inboxLogin`),t=document.getElementById(`inboxShell`),n=document.getElementById(`loginForm`),r=document.getElementById(`loginError`),i=document.getElementById(`loginSubmit`),a=document.getElementById(`inboxRows`),o=document.getElementById(`listEmpty`),s=document.getElementById(`inboxDetail`),c=document.getElementById(`refreshBtn`),l=document.getElementById(`logoutBtn`),u=document.getElementById(`unreadBadge`),d=document.getElementById(`searchInput`),f=document.getElementById(`filterStatus`),p=document.getElementById(`sortOrder`),m=[],h=null,g;function _(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function v(e){try{return new Date(e.replace(` `,`T`)+`Z`).toLocaleString(void 0,{month:`short`,day:`numeric`,hour:`numeric`,minute:`2-digit`})}catch{return e}}function y(e){let t=(e||``).trim().split(/\s+/).filter(Boolean);return t.length?((t[0][0]||``)+(t.length>1&&t[t.length-1][0]||``)).toUpperCase():`?`}function b(e){let t=new Date(e.replace(` `,`T`)+`Z`),n=new Date,r=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),i=Math.round((r(n)-r(t))/864e5);return i<=0?`Today`:i===1?`Yesterday`:i<7?`This week`:`Earlier`}function x(){if(!u)return;let e=m.filter(e=>!Number(e.is_read)).length;u.textContent=e>99?`99+`:String(e),u.hidden=e===0}function S(){let e=(d?.value||``).trim().toLowerCase(),t=f?.value||`all`,n=p?.value||`newest`,r=m.filter(n=>t===`unread`&&Number(n.is_read)||t===`read`&&!Number(n.is_read)?!1:!e||[n.name,n.email,n.company,n.service,n.message].filter(Boolean).join(` `).toLowerCase().includes(e));return r.sort((e,t)=>{let r=new Date(e.submitted_at.replace(` `,`T`)+`Z`).getTime(),i=new Date(t.submitted_at.replace(` `,`T`)+`Z`).getTime();return n===`oldest`?r-i:i-r}),r}async function C(e,t={}){let n=await fetch(`/inbox/api.php?action=${e}`,{credentials:`same-origin`,headers:{"Content-Type":`application/json`},...t}),r=await n.json().catch(()=>({ok:!1,error:`Bad response from server.`}));return n.status===401&&w(),{status:n.status,data:r}}function w(){g&&window.clearInterval(g),t?.setAttribute(`hidden`,``),e?.removeAttribute(`hidden`)}function T(){e?.setAttribute(`hidden`,``),t?.removeAttribute(`hidden`),D(),g=window.setInterval(D,45e3)}function E(){if(!a)return;a.querySelectorAll(`.inbox-row, .inbox-group-header`).forEach(e=>e.remove()),x();let e=S();o&&(o.classList.remove(`inbox-empty-error`),m.length===0?(o.hidden=!1,o.textContent=`No enquiries yet.`):e.length===0?(o.hidden=!1,o.textContent=`No enquiries match your search or filters.`):o.hidden=!0);let t=null;for(let n of e){let e=b(n.submitted_at);if(e!==t){let n=document.createElement(`div`);n.className=`inbox-group-header`,n.textContent=e,a.appendChild(n),t=e}let r=document.createElement(`button`);r.type=`button`,r.className=`inbox-row`+(Number(n.is_read)?``:` unread`)+(n.id===h?` active`:``),r.dataset.id=String(n.id);let i=(n.message||``).slice(0,90)+(n.message?.length>90?`…`:``),o=(n.service?_(n.service):`General enquiry`)+(n.company?` &middot; ${_(n.company)}`:``);r.innerHTML=`
            <div class="inbox-row-top">
              <span class="inbox-row-name">${_(n.name)}</span>
              <span class="inbox-row-date">${v(n.submitted_at)}</span>
            </div>
            <div class="inbox-row-subject">${o}</div>
            <div class="inbox-row-snippet">${_(i)}</div>
          `,r.addEventListener(`click`,()=>O(n.id)),a.appendChild(r)}}async function D(){let{data:e}=await C(`list`);if(!e.ok){a&&a.querySelectorAll(`.inbox-row, .inbox-group-header`).forEach(e=>e.remove()),o&&(o.hidden=!1,o.classList.add(`inbox-empty-error`),o.textContent=e.error||`Couldn't load enquiries.`);return}m=e.inquiries||[],E()}async function O(e){if(h=e,E(),!s)return;s.innerHTML=`<div class="inbox-placeholder">Loading…</div>`;let{data:t}=await C(`detail&id=${e}`);if(!t.ok){s.innerHTML=`<div class="inbox-placeholder">Couldn't load this enquiry.</div>`;return}let n=t.inquiry,r=t.replies||[];s.innerHTML=`
          <div class="detail-fade">
            <div class="detail-head">
              <div class="detail-subject">${(n.service?`${_(n.service)} enquiry`:`New enquiry`)+` from ${_(n.name)}`}</div>
              <div class="detail-head-top">
                <div class="detail-avatar" aria-hidden="true">${y(n.name)}</div>
                <div class="detail-identity">
                  <div class="detail-name-row">
                    <span class="detail-name">${_(n.name)}</span>
                    <span class="detail-date">${v(n.submitted_at)}</span>
                  </div>
                  <div class="detail-meta">
                    <a href="mailto:${_(n.email)}">${_(n.email)}</a>
                    ${n.company?`<span>&middot; ${_(n.company)}</span>`:``}
                    ${n.service?`<span class="tag">${_(n.service)}</span>`:``}
                  </div>
                </div>
              </div>
            </div>
            <div class="detail-message">${_(n.message)}</div>
            <div class="detail-thread" id="detailThread"></div>
            <div class="reply-box">
              <span class="reply-box-label">Reply to ${_(n.name)}</span>
              <textarea id="replyText" placeholder="Write a reply…" rows="5"></textarea>
              <div class="reply-actions">
                <span class="reply-status" id="replyStatus"></span>
                <button type="button" class="btn btn-primary" id="replySend" disabled>Send reply</button>
              </div>
            </div>
          </div>
        `;let i=document.getElementById(`detailThread`);i&&r.length&&(i.innerHTML=r.map(e=>`
            <div class="reply-item ${e.sent_ok?``:`reply-failed`}">
              <div class="reply-item-meta">${e.sent_ok?`You replied`:`Failed to send`} &middot; ${v(e.sent_at)}</div>
              <div class="reply-item-body">${_(e.reply_body)}</div>
            </div>
          `).join(``)),document.getElementById(`replySend`)?.addEventListener(`click`,()=>k(e));let a=document.getElementById(`replyText`),o=document.getElementById(`replySend`);if(a?.addEventListener(`input`,()=>{o&&(o.disabled=!a.value.trim())}),!Number(n.is_read)){await C(`mark_read`,{method:`POST`,body:JSON.stringify({id:e,read:!0})});let t=m.find(t=>t.id===e);t&&(t.is_read=1),E()}}async function k(e){let t=document.getElementById(`replyText`),n=document.getElementById(`replyStatus`),r=document.getElementById(`replySend`),i=t?.value.trim();if(!i)return;r&&(r.disabled=!0),n&&(n.textContent=`Sending…`,n.className=`reply-status`);let{data:a}=await C(`reply`,{method:`POST`,body:JSON.stringify({id:e,body:i})});a.ok?(t&&(t.value=``),O(e)):(n&&(n.textContent=a.error||`Couldn't send that reply.`,n.className=`reply-status reply-status-error`),r&&(r.disabled=!1))}n?.addEventListener(`submit`,async e=>{e.preventDefault(),r&&(r.hidden=!0),i&&(i.disabled=!0,i.textContent=`Signing in…`);let t=new FormData(n),a=await(await fetch(`/inbox/login.php`,{method:`POST`,credentials:`same-origin`,headers:{"Content-Type":`application/json`},body:JSON.stringify({username:t.get(`username`),password:t.get(`password`)})})).json().catch(()=>({ok:!1,error:`Unexpected error.`}));i&&(i.disabled=!1,i.textContent=`Sign in →`),a.ok?(n.reset(),T()):r&&(r.textContent=a.error||`That username or password didn't match.`,r.hidden=!1)}),l?.addEventListener(`click`,async()=>{await fetch(`/inbox/logout.php`,{credentials:`same-origin`}),w()}),c?.addEventListener(`click`,D),d?.addEventListener(`input`,E),f?.addEventListener(`change`,E),p?.addEventListener(`change`,E),(async()=>{let{status:e,data:t}=await C(`list`);if(e===401||e===200&&!t?.ok){w();return}T()})();