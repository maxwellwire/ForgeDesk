module.exports = [
"[project]/app/campaigns/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CampaignDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function CampaignDetailPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const id = params.id;
    const [campaign, setCampaign] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [me, setMe] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [actionMsg, setActionMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [openTaskId, setOpenTaskId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [proofUrl, setProofUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [proofText, setProofText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitMsg, setSubmitMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadCampaign();
        fetch("/api/auth/me").then((res)=>res.json()).then((json)=>{
            if (json.success) setMe(json.data);
        });
    }, [
        id
    ]);
    function loadCampaign() {
        fetch(`/api/campaigns/${id}`).then((res)=>res.json()).then((json)=>{
            if (json.success) setCampaign(json.data);
            setLoading(false);
        });
    }
    async function handleParticipate() {
        setActionMsg(null);
        const res = await fetch(`/api/participations/${id}`, {
            method: "POST"
        });
        const json = await res.json();
        if (!json.success) {
            setActionMsg(json.error?.message || `Error: ${json.error?.code}`);
            return;
        }
        setCampaign((prev)=>prev ? {
                ...prev,
                isParticipating: true
            } : prev);
        setActionMsg("You're in! You can now submit proof for each task below.");
    }
    async function handleSubmitProof(taskId) {
        if (!proofUrl && !proofText) {
            setSubmitMsg((prev)=>({
                    ...prev,
                    [taskId]: "Add a URL or a short description of your proof."
                }));
            return;
        }
        setSubmitting(true);
        const res = await fetch("/api/submissions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                campaignId: id,
                taskId,
                proofUrl: proofUrl || undefined,
                proofText: proofText || undefined
            })
        });
        const json = await res.json();
        setSubmitting(false);
        if (!json.success) {
            setSubmitMsg((prev)=>({
                    ...prev,
                    [taskId]: json.error?.message || `Error: ${json.error?.code}`
                }));
            return;
        }
        setSubmitMsg((prev)=>({
                ...prev,
                [taskId]: "Submitted — pending review."
            }));
        setOpenTaskId(null);
        setProofUrl("");
        setProofText("");
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            style: pageStyle,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#9A9A93"
                },
                children: "Loading…"
            }, void 0, false, {
                fileName: "[project]/app/campaigns/[id]/page.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 100,
            columnNumber: 7
        }, this);
    }
    if (!campaign) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            style: pageStyle,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#F5F5F0"
                },
                children: "Campaign not found."
            }, void 0, false, {
                fileName: "[project]/app/campaigns/[id]/page.tsx",
                lineNumber: 109,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 108,
            columnNumber: 7
        }, this);
    }
    let cta;
    if (!me) {
        cta = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: "/login",
            style: buttonStyle,
            children: "Sign up / Log in"
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 117,
            columnNumber: 7
        }, this);
    } else if (!me.emailVerified) {
        cta = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: "/dashboard",
            style: {
                ...buttonStyle,
                background: "#161616",
                color: "#F5F5F0",
                border: "1px solid rgba(255,107,107,0.3)"
            },
            children: "Verify your email to participate"
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 123,
            columnNumber: 7
        }, this);
    } else if (campaign.isParticipating) {
        cta = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                ...buttonStyle,
                background: "#161616",
                color: "#C8FF4D",
                border: "1px solid rgba(200,255,77,0.3)"
            },
            children: "✓ Participating"
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 128,
            columnNumber: 11
        }, this);
    } else {
        cta = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleParticipate,
            style: {
                ...buttonStyle,
                border: "none",
                cursor: "pointer"
            },
            children: "Participate"
        }, void 0, false, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 131,
            columnNumber: 7
        }, this);
    }
    const canSubmit = me && me.emailVerified && campaign.isParticipating;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: pageStyle,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 640,
                margin: "0 auto"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "#F5F5F0",
                        marginBottom: 32
                    },
                    children: [
                        "Forge",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#C8FF4D"
                            },
                            children: "Desk"
                        }, void 0, false, {
                            fileName: "[project]/app/campaigns/[id]/page.tsx",
                            lineNumber: 143,
                            columnNumber: 16
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: "#9A9A93",
                        marginBottom: 8
                    },
                    children: campaign.project.name
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: 26,
                        color: "#F5F5F0",
                        margin: "0 0 16px"
                    },
                    children: campaign.title
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 149,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#9A9A93",
                        fontSize: 14,
                        lineHeight: 1.6,
                        marginBottom: 24
                    },
                    children: campaign.description
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 152,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: 24
                    },
                    children: cta
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 156,
                    columnNumber: 9
                }, this),
                actionMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#C8FF4D",
                        fontSize: 13.5,
                        marginBottom: 24
                    },
                    children: actionMsg
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 159,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: 24,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: "#9A9A93",
                        marginBottom: 32,
                        paddingBottom: 24,
                        borderBottom: "1px solid rgba(255,255,255,0.08)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                campaign._count.participations,
                                " participants"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/campaigns/[id]/page.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#C8FF4D"
                            },
                            children: campaign.rewardDescription
                        }, void 0, false, {
                            fileName: "[project]/app/campaigns/[id]/page.tsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: 17,
                        color: "#F5F5F0",
                        marginBottom: 16
                    },
                    children: "Tasks"
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 167,
                    columnNumber: 9
                }, this),
                campaign.tasks.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#9A9A93",
                        fontSize: 13.5
                    },
                    children: "No tasks have been added to this campaign yet."
                }, void 0, false, {
                    fileName: "[project]/app/campaigns/[id]/page.tsx",
                    lineNumber: 172,
                    columnNumber: 11
                }, this),
                campaign.tasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: "#161616",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: "#F5F5F0",
                                    fontSize: 15,
                                    margin: "0 0 6px"
                                },
                                children: task.title
                            }, void 0, false, {
                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#9A9A93",
                                    fontSize: 13,
                                    margin: "0 0 12px"
                                },
                                children: task.instructions
                            }, void 0, false, {
                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this),
                            canSubmit && openTaskId !== task.id && !submitMsg[task.id] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpenTaskId(task.id),
                                style: {
                                    background: "transparent",
                                    border: "1px solid rgba(200,255,77,0.3)",
                                    color: "#C8FF4D",
                                    borderRadius: 6,
                                    padding: "6px 12px",
                                    fontSize: 12.5,
                                    cursor: "pointer"
                                },
                                children: "Submit proof"
                            }, void 0, false, {
                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                lineNumber: 181,
                                columnNumber: 15
                            }, this),
                            canSubmit && openTaskId === task.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: proofUrl,
                                        onChange: (e)=>setProofUrl(e.target.value),
                                        placeholder: "Link to your post (optional)",
                                        style: miniInputStyle
                                    }, void 0, false, {
                                        fileName: "[project]/app/campaigns/[id]/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: proofText,
                                        onChange: (e)=>setProofText(e.target.value),
                                        placeholder: "Or describe your proof",
                                        rows: 2,
                                        style: {
                                            ...miniInputStyle,
                                            resize: "vertical",
                                            marginTop: 8
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/campaigns/[id]/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 8,
                                            marginTop: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleSubmitProof(task.id),
                                                disabled: submitting,
                                                style: {
                                                    background: "#C8FF4D",
                                                    color: "#0D0D0D",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: "7px 14px",
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    cursor: "pointer"
                                                },
                                                children: submitting ? "Submitting…" : "Submit"
                                            }, void 0, false, {
                                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setOpenTaskId(null),
                                                style: {
                                                    background: "transparent",
                                                    color: "#9A9A93",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: 6,
                                                    padding: "7px 14px",
                                                    fontSize: 12.5,
                                                    cursor: "pointer"
                                                },
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/campaigns/[id]/page.tsx",
                                        lineNumber: 204,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                lineNumber: 190,
                                columnNumber: 15
                            }, this),
                            submitMsg[task.id] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#C8FF4D",
                                    fontSize: 12.5,
                                    marginTop: 8
                                },
                                children: submitMsg[task.id]
                            }, void 0, false, {
                                fileName: "[project]/app/campaigns/[id]/page.tsx",
                                lineNumber: 223,
                                columnNumber: 15
                            }, this)
                        ]
                    }, task.id, true, {
                        fileName: "[project]/app/campaigns/[id]/page.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/app/campaigns/[id]/page.tsx",
            lineNumber: 141,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/campaigns/[id]/page.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
const pageStyle = {
    minHeight: "100vh",
    background: "#0D0D0D",
    padding: "32px 20px",
    fontFamily: "Inter, sans-serif"
};
const buttonStyle = {
    display: "inline-block",
    padding: "10px 20px",
    background: "#C8FF4D",
    color: "#0D0D0D",
    borderRadius: 7,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none"
};
const miniInputStyle = {
    width: "100%",
    padding: "8px 10px",
    background: "#0D0D0D",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    color: "#F5F5F0",
    fontSize: 13,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box"
};
}),
];

//# sourceMappingURL=app_campaigns_%5Bid%5D_page_tsx_0wg60uu._.js.map