import React, { useMemo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageLayout } from "@/shared/components/layout/PageWrapper/PageLayout";
import { Card } from "@/shared/components/ui/Card/Card";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Copy, Info, Mail } from "lucide-react";
import { FormHeader, FormField, FormCard } from "@/shared/components/ui/Form";

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
    /* Reactive Form Values                             */
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
                { onSuccess: () => { showToast("success", "Template updated"); onBack(); } }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => { showToast("success", "Template created"); onBack(); },
            });
        }
    };

    return (
        <PageLayout title={isEditing ? "Edit Email Template" : "Create Email Template"} showBackButton onBack={onBack}>
            <div className="max-w-[1400px] mx-auto">
                <FormHeader icon={Mail} title={isEditing ? "Edit Email Template" : "New Email Template"} subtitle="Design email templates with dynamic variable placeholders" color="rose" />

                <div className="grid lg:grid-cols-4 gap-5">
                    {/* ---- TEMPLATE FORM ---- */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
                            {/* Edit/Preview Toggle */}
                            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Template Details</h3>
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border dark:border-slate-700">
                                    <button type="button" onClick={() => setPreviewMode(false)} className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${!previewMode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-gray-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'}`}>Edit</button>
                                    <button type="button" onClick={() => setPreviewMode(true)} className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${previewMode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-gray-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'}`}>Preview</button>
                                </div>
                            </div>

                            <form id="template-form" className="p-5" onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <FormField label="Template Name" required>
                                            <Input placeholder="New User Onboarding" {...register("name")} className="h-10" />
                                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                        </FormField>
                                        <div>{/* spacer */}</div>
                                    </div>

                                    <FormField label="Subject Line" required>
                                        {previewMode ? (
                                            <div className="min-h-[44px] flex items-center w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-[14px] text-slate-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(watchSubject) }} />
                                        ) : (
                                            <>
                                                <Input placeholder="Welcome {{user_name}}" {...register("subject")} className="h-10" />
                                                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                                            </>
                                        )}
                                    </FormField>

                                    <FormField label="HTML Body" required>
                                        {previewMode ? (
                                            <div className="min-h-[200px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(watchBodyHtml) }} />
                                        ) : (
                                            <>
                                                <Textarea rows={8} placeholder="<p>Hello {{user_name}}</p>" {...register("body_html")} />
                                                {errors.body_html && <p className="text-xs text-red-500 mt-1">{errors.body_html.message}</p>}
                                            </>
                                        )}
                                    </FormField>

                                    <FormField label="Plain Text Body">
                                        <Textarea rows={4} placeholder="Hello {{user_name}}" {...register("body_text")} />
                                    </FormField>
                                </div>

                                <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100 dark:border-slate-700">
                                    <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? 'Saving...' : (isEditing ? "Update Template" : "Create Template")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ---- VARIABLE HELPER ---- */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-2 font-semibold text-sm mb-3 text-slate-700 dark:text-gray-300">
                                <Info className="w-4 h-4" />
                                Variables
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Click to copy placeholders</p>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {COMMON_VARIABLES.map((v) => (
                                    <button
                                        key={v.name}
                                        type="button"
                                        onClick={() => copyToClipboard(v.name)}
                                        className="w-full text-left p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:border-rose-200 dark:hover:border-rose-800 transition-all"
                                    >
                                        <div className="flex justify-between items-center">
                                            <code className="text-xs font-bold text-slate-800 dark:text-gray-200">{`{{ ${v.name} }}`}</code>
                                            <Copy className="w-3 h-3 opacity-50" />
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{v.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}