<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|min:2|max:80',
            'last_name'  => 'required|string|min:2|max:80',
            'email'      => 'required|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => 'sometimes|string|in:admin,analyst,researcher,student,journalist,manager,other',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.min'      => 'Le prénom doit contenir au moins 2 caractères.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'email.required'      => 'L\'adresse email est obligatoire.',
            'email.email'         => 'Format d\'email invalide.',
            'email.unique'        => 'Cet email est déjà utilisé.',
            'password.required'   => 'Le mot de passe est obligatoire.',
            'password.min'        => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'  => 'Les mots de passe ne correspondent pas.',
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
