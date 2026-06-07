<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Le mot de passe actuel est obligatoire.',
            'new_password.required'     => 'Le nouveau mot de passe est obligatoire.',
            'new_password.min'          => 'Minimum 8 caractères.',
            'new_password.confirmed'    => 'Les mots de passe ne correspondent pas.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Données invalides.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}