import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Upload,
  X,
  FileText,
  ArrowLeft,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import {
  createTicket,
  uploadAttachment,
  categorizeTicket,
  detectPriority,
} from "../api/api";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
  });

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  async function handleAnalyzeWithAI() {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please enter a title and description before using AI.");
      return;
    }

    try {
      setIsAnalyzing(true);

      const payload = {
        title: formData.title,
        description: formData.description,
      };

      const [categoryRes, priorityRes] = await Promise.all([
        categorizeTicket(payload),
        detectPriority(payload),
      ]);

      setAiSuggestions({
        category: categoryRes.data.category,
        categoryReason: categoryRes.data.reason,
        priority: priorityRes.data.priority,
        priorityReason: priorityRes.data.reason,
      });
    } catch (error) {
      console.error(error);
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applyAiSuggestions() {
    if (!aiSuggestions) return;

    setFormData({
      ...formData,
      category: aiSuggestions.category,
      priority: aiSuggestions.priority,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await createTicket(formData);
      const newTicketId = response.data.id;

      for (const file of files) {
        const attachmentData = new FormData();
        attachmentData.append("file", file);

        await uploadAttachment(newTicketId, attachmentData);
      }

      navigate(`/tickets/${newTicketId}`);
    } catch (error) {
      console.error(error);
      alert("Could not create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(e) {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function removeFile(index) {
    setFiles(files.filter((file, i) => i !== index));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h1 className="text-3xl font-semibold">Create New Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Submit a support request and we&apos;ll get back to you shortly
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Ticket Title <span className="text-destructive">*</span>
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed information about the issue..."
              rows={6}
              className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />

            <p className="text-xs text-muted-foreground">
              Please include error messages, steps to reproduce, and expected
              behavior.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Ticket Analysis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Let AI suggest the best category and priority.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </button>
            </div>

            {aiSuggestions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Suggested Category
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    {aiSuggestions.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {aiSuggestions.categoryReason}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Suggested Priority
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    {aiSuggestions.priority}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {aiSuggestions.priorityReason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyAiSuggestions}
                  className="md:col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Apply AI Suggestions
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </label>

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a category</option>
                <option value="Authentication">Authentication</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Email">Email</option>
                <option value="Account Access">Account Access</option>
                <option value="Payment">Payment</option>
                <option value="Performance">Performance</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General">General</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Priority <span className="text-destructive">*</span>
              </label>

              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Attachments</label>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={
                "border-2 border-dashed rounded-lg p-8 transition-colors " +
                (isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-accent/50")
              }
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="w-6 h-6 text-primary" />
                </div>

                <div className="text-center">
                  <p className="font-medium">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />

                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-accent border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />

                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>

            <Link
              to="/dashboard"
              className="flex-1 md:flex-none px-6 py-3 bg-accent text-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="bg-chart-1/10 border border-chart-1/20 rounded-xl p-6">
        <h3 className="font-semibold mb-2 text-chart-1">
          Need Immediate Help?
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          For critical issues, contact{" "}
          <a
            href="mailto:support@helpdesk.com"
            className="text-primary hover:underline"
          >
            support@helpdesk.com
          </a>
        </p>
      </div>
    </div>
  );
}