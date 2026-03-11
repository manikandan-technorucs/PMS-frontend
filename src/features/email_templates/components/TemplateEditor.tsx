import React, { useMemo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageLayout } from "@/shared/components/layout/PageWrapper/PageLayout";
import { Card } from "@/shared/components/ui/Card/Card";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";

import { ArrowLeft, Save, Copy, Info } from "lucide-react";

import {
    emailTemplateSchema,
    EmailTemplateFormData,
    EmailTemplate,
} from "../types";

import {
    useCreateEmailTemplate,
    useUpdateEmailTemplate,
} from "../hooks/useEmailTemplates";

import { useToast } from "@/shared/context/ToastContext";

interface TemplateEditorProps {
    template?: EmailTemplate | null;
    onBack: () => void;
}

const DEFAULT_VALUES: EmailTemplateFormData = {
    name: "",
    subject: "",
    body_html: "",
    body_text: "",
    is_active: true,
};

export function TemplateEditor({ template, onBack }: TemplateEditorProps) {
    const { showToast } = useToast();

    const createMutation = useCreateEmailTemplate();
    const updateMutation = useUpdateEmailTemplate();

    const isEditing = Boolean(template);
    const isPending = createMutation.isPending || updateMutation.isPending;

    /* ------------------------------------------------ */
    /* Variables Helper                                 */
    /* ------------------------------------------------ */

    const COMMON_VARIABLES = useMemo(
        () => [
            { name: "user_name", desc: "Full name of the recipient" },
            { name: "project_name", desc: "Project name" },
            { name: "project_id", desc: "Public project ID" },
            { name: "task_title", desc: "Task title" },
            { name: "task_id", desc: "Public task ID" },
            { name: "issue_title", desc: "Issue title" },
            { name: "issue_id", desc: "Public issue ID" },
            { name: "status_name", desc: "Current status name" },
            { name: "new_status", desc: "New status value" },
            { name: "old_status", desc: "Previous status value" },
            { name: "team_name", desc: "Team name" },
            { name: "team_id", desc: "Public team ID" },
            { name: "assignee_name", desc: "Assigned user" },
            { name: "manager_name", desc: "Project manager" },
        ],
        []
    );

    /* ------------------------------------------------ */
    /* Reactive Form Values (Fixes Validation Bug)      */
    /* ------------------------------------------------ */

    const formValues = useMemo(() => {
        if (!template) return DEFAULT_VALUES;

        return {
            name: template.name ?? "",
            subject: template.subject ?? "",
            body_html: template.body_html ?? "",
            body_text: template.body_text ?? "",
            is_active: template.is_active ?? true,
        };
    }, [template]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<EmailTemplateFormData>({
        resolver: zodResolver(emailTemplateSchema),
        values: formValues,
        mode: "onSubmit",
    });

    const watchSubject = watch("subject") || "";
    const watchBodyHtml = watch("body_html") || "";

    const [previewMode, setPreviewMode] = useState(false);

    const renderPreviewHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/\{\{([\s\S]+?)\}\}/g, '<code class="px-1.5 py-0.5 bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1] rounded-md text-[13px] font-mono mx-0.5 whitespace-nowrap">{{$1}}</code>');
    };

    /* ------------------------------------------------ */
    /* Clipboard Helper                                 */
    /* ------------------------------------------------ */

    const copyToClipboard = useCallback(
        async (variable: string) => {
            const text = `{{ ${variable} }}`;

            try {
                await navigator.clipboard.writeText(text);
                showToast("success", "Copied", `${text} copied`);
            } catch {
                showToast("error", "Copy failed", "Clipboard permission denied");
            }
        },
        [showToast]
    );

    /* ------------------------------------------------ */
    /* Submit Logic                                     */
    /* ------------------------------------------------ */

    const onSubmit = (data: EmailTemplateFormData) => {
        if (isPending) return;

        if (isEditing && template) {
            updateMutation.mutate(
                { id: template.id, data },
                {
                    onSuccess: () => {
                        showToast("success", "Template updated");
                        onBack();
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    showToast("success", "Template created");
                    onBack();
                },
            });
        }
    };

    return (
        <PageLayout
            title={isEditing ? "Edit Email Template" : "Create Email Template"}
            actions={
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button type="submit" form="template-form" disabled={isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            }
        >
            <div className="grid lg:grid-cols-4 gap-6">
                {/* --------------------------------------------- */}
                {/* TEMPLATE FORM                                 */}
                {/* --------------------------------------------- */}

                <div className="lg:col-span-3">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[16px] font-semibold text-theme-primary">Template Details</h3>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border dark:border-slate-700">
                                <button type="button" onClick={() => setPreviewMode(false)} className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${!previewMode ? 'bg-white dark:bg-slate-700 shadow-sm text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}>Edit</button>
                                <button type="button" onClick={() => setPreviewMode(true)} className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${previewMode ? 'bg-white dark:bg-slate-700 shadow-sm text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}>Preview</button>
                            </div>
                        </div>

                        <form
                            id="template-form"
                            className="space-y-6"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Template Name */}

                                <div>
                                    <label className="text-sm font-medium">
                                        Template Name *
                                    </label>

                                    <Input
                                        placeholder="New User Onboarding"
                                        {...register("name")}
                                    />

                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                {/* Subject */}

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">
                                        Subject Line *
                                    </label>

                                    {previewMode ? (
                                        <div className="min-h-[44px] flex items-center w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-[14px] text-theme-primary" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(watchSubject) }} />
                                    ) : (
                                        <>
                                            <Input
                                                placeholder="Welcome {{user_name}}"
                                                {...register("subject")}
                                            />
                                            {errors.subject && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.subject.message}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* HTML Body */}

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">
                                        HTML Body *
                                    </label>

                                    {previewMode ? (
                                        <div className="min-h-[200px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 prose prose-sm dark:prose-invert max-w-none text-theme-primary" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(watchBodyHtml) }} />
                                    ) : (
                                        <>
                                            <Textarea
                                                rows={8}
                                                placeholder="<p>Hello {{user_name}}</p>"
                                                {...register("body_html")}
                                            />
                                            {errors.body_html && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.body_html.message}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Plain Text */}

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">
                                        Plain Text Body
                                    </label>

                                    <Textarea
                                        rows={4}
                                        placeholder="Hello {{user_name}}"
                                        {...register("body_text")}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={onBack}>
                                    Cancel
                                </Button>

                                <Button type="submit" disabled={isPending}>
                                    {isEditing ? "Update Template" : "Create Template"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* --------------------------------------------- */}
                {/* VARIABLE HELPER                               */}
                {/* --------------------------------------------- */}

                <div className="space-y-4">
                    <Card>
                        <div className="flex items-center gap-2 font-semibold text-sm mb-3">
                            <Info className="w-4 h-4" />
                            Variables
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                            Click to copy placeholders
                        </p>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {COMMON_VARIABLES.map((v) => (
                                <button
                                    key={v.name}
                                    type="button"
                                    onClick={() => copyToClipboard(v.name)}
                                    className="w-full text-left p-2 border rounded hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <code className="text-xs font-bold">
                                            {`{{ ${v.name} }}`}
                                        </code>

                                        <Copy className="w-3 h-3 opacity-60" />
                                    </div>

                                    <div className="text-[10px] text-gray-500">
                                        {v.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
}