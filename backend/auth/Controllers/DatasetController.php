<?php

namespace App\Http\Controllers;

use App\Models\Dataset;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DatasetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $datasets = Dataset::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'count'   => $datasets->count(),
            'data'    => $datasets,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,json,txt|max:10240',
            'name' => 'required|string|max:255',
        ]);

        $file     = $request->file('file');
        $ext      = $file->getClientOriginalExtension();
        $filename = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs('uploads', $filename, 'local');
        $content  = file_get_contents(storage_path('app/' . $path));
        $rowCount = 0;
        $columns  = [];

        if ($ext === 'json') {
            $data     = json_decode($content, true);
            $rows     = is_array($data) ? $data : [$data];
            $rowCount = count($rows);
            $columns  = array_keys($rows[0] ?? []);
        } else {
            $lines    = array_filter(explode("\n", trim($content)));
            $rowCount = max(0, count($lines) - 1);
            $columns  = str_getcsv($lines[0] ?? '');
        }

        $dataset = Dataset::create([
            'user_id'   => $request->user()->id,
            'name'      => $request->name,
            'filename'  => $filename,
            'path'      => $path,
            'type'      => $ext,
            'row_count' => $rowCount,
            'columns'   => json_encode($columns),
            'status'    => 'processed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fichier importé avec succès',
            'data'    => $dataset,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $dataset = Dataset::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $dataset,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $dataset = Dataset::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        Storage::disk('local')->delete($dataset->path);

        $dataset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dataset supprimé avec succès',
        ]);
    }
}