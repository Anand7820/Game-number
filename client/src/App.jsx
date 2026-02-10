import { useMemo, useState } from "react";

function normalizeCounts(counts) {
  return Object.entries(counts || {}).sort(
    ([a], [b]) => Number(a) - Number(b)
  );
}

export default function App() {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState(null);

  const entries = useMemo(() => normalizeCounts(counts), [counts]);
  const maxCount = useMemo(() => {
    if (!entries.length) return 0;
    return Math.max(...entries.map(([, value]) => value));
  }, [entries]);

  const reset = () => {
    setTextInput("");
    setImageFile(null);
    setError("");
    setCounts(null);
  };

  const submitText = async () => {
    const response = await fetch("/count-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to process text.");
    }
    return data.counts;
  };

  const submitImage = async () => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await fetch("/count-image", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to process image.");
    }
    return data.counts;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCounts(null);

    if (!textInput.trim() && !imageFile) {
      setError("Please enter numbers or upload an image.");
      return;
    }

    try {
      setLoading(true);
      const nextCounts = imageFile ? await submitImage() : await submitText();
      setCounts(nextCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files?.[0]) {
      setImageFile(event.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Number Counting Web-App</h1>
          <p className="text-slate-600 mt-2">
            Enter numbers or upload an image, then count frequency.
          </p>
        </header>

        <section className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Manual Input (comma or space separated)
              </label>
              <textarea
                rows="4"
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                className="w-full rounded border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Example: 1, 2, 2 45 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 hover:border-indigo-400"
              >
                <p className="mb-2">Drag and drop an image here</p>
                <p className="text-xs">JPG or PNG only</p>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="mt-4"
                />
                {imageFile && (
                  <p className="text-xs text-slate-700 mt-2">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={reset}
                className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300"
              >
                Reset
              </button>
              {loading && (
                <span className="text-sm text-indigo-600">
                  Processing image...
                </span>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          {!counts && (
            <div className="text-slate-500 bg-white rounded-lg p-4">
              No results yet.
            </div>
          )}

          {counts && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-2">Number</th>
                      <th className="px-4 py-2">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {entries.map(([number, count]) => (
                      <tr key={number}>
                        <td className="px-4 py-2">{number}</td>
                        <td className="px-4 py-2">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium mb-3">Frequency Chart</h3>
                <div className="space-y-2">
                  {entries.map(([number, count]) => (
                    <div key={number} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-16">
                        {number} ({count})
                      </span>
                      <div
                        className="h-3 bg-indigo-500 rounded"
                        style={{
                          width: `${maxCount ? (count / maxCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
