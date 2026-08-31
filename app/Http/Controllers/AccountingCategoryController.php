<?php

namespace App\Http\Controllers;

use App\Models\AccountingCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingCategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('accounting-categories/index', [
            'categories' => AccountingCategory::withCount('transactions')->orderBy('type')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        AccountingCategory::create($validated);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, AccountingCategory $accountingCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $accountingCategory->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(AccountingCategory $accountingCategory): RedirectResponse
    {
        $accountingCategory->delete();

        return back()->with('success', 'Category deleted.');
    }
}
