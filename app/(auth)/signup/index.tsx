import { useState } from "react";

import { useForm, Controller } from 'react-hook-form';
import {Link,router} from 'expo-router'
import {z} from 'zod';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,SafeAreaViewBase} from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import {zodResolver} from '@hookform/resolvers/zod'
import { supabase } from "@/lib/supabase";

const SignupSchema = z.object({
    name: z.string().min(6,"El nombre debe tener al menos 6 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6,"La contraseña debe tener al menos 6 caracteres")

})

type SignUpForm = z.infer<typeof SignupSchema>;

export default function Signup(){

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null);

    const {control,handleSubmit,formState:{errors}} = useForm<SignUpForm>({
        resolver: zodResolver(SignupSchema)
    });

    const onSubmit = async (data:SignUpForm) => {
        try{

            setLoading(true);
            setError(null);

            //Logica de registro
            const {error:singupError} = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options:{
                    data:{
                        name: data.name
                    }
                }
              
            });
            if (singupError){
                throw singupError;

            }

            const {error : loginError} = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            })

            if (loginError){
                throw loginError;
            }


        }catch(error){

            setError(error instanceof Error ? error.message : String(error) );

        } finally{
            setLoading(false);
        }
    }



    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        link: {
            marginTop: 15,
            paddingVertical: 15,
        },
        title:{
            fontSize: 24,
        },
        subtitle:{
            fontSize: 16,
        }
    });


    return (
        <SafeAreaViewBase style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    Registrate
                </Text>
                <Text style={styles.subtitle}>
                    Crea una cuenta para continuar
                </Text>

            </View>
        </SafeAreaViewBase>
        
    );


   




}