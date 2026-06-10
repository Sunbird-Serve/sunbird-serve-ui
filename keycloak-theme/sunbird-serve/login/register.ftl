<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "header">
        <div id="kc-logo-wrapper">
            <img src="${url.resourcesPath}/img/logo.png" alt="Sunbird Serve" onerror="this.style.display='none'" />
        </div>
        <div style="text-align: center; margin-bottom: 8px;">
            <span style="font-size: 1.4rem; font-weight: 700; color: #0E7490;">Create Account</span>
        </div>
        <div style="text-align: center; color: #475569; font-size: 0.85rem;">
            Join Sunbird Serve as a Volunteer
        </div>
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="firstName" class="control-label">First Name</label>
                <input type="text" id="firstName" class="form-control" name="firstName" value="${(register.formData.firstName!'')}" placeholder="Enter first name" />
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="lastName" class="control-label">Last Name</label>
                <input type="text" id="lastName" class="form-control" name="lastName" value="${(register.formData.lastName!'')}" placeholder="Enter last name" />
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="email" class="control-label">Email</label>
                <input type="email" id="email" class="form-control" name="email" value="${(register.formData.email!'')}" placeholder="Enter your email" autocomplete="email" />
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="password" class="control-label">Password</label>
                <input type="password" id="password" class="form-control" name="password" placeholder="Create a password" autocomplete="new-password" />
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="password-confirm" class="control-label">Confirm Password</label>
                <input type="password" id="password-confirm" class="form-control" name="password-confirm" placeholder="Confirm your password" />
            </div>

            <div id="kc-form-buttons" style="margin-top: 20px;">
                <input class="btn-primary" type="submit" value="Create Account" />
            </div>
        </form>
    <#elseif section = "info">
        <div id="kc-registration" style="text-align: center; margin-top: 20px;">
            <span>Already have an account? <a href="${url.loginUrl}">Sign In</a></span>
        </div>
    </#if>
</@layout.registrationLayout>
